//! Agent Skills: folders containing a `SKILL.md` with YAML-ish frontmatter.
//!
//! Skills are discovered from the workspace and user directories, advertised
//! to the model in a compact prompt section, and loaded on demand through the
//! [`SkillTool`].

use std::collections::HashSet;
use std::path::{Path, PathBuf};

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::{EffectClass, HarnessError, HarnessResult, Tool, ToolContext, ToolOutput, ToolSpec};

const MAX_SKILL_FILE_BYTES: u64 = 256 * 1024;
const MAX_DESCRIPTION_CHARS: usize = 300;
const MAX_LISTED_FILES: usize = 50;
const MAX_WALK_DEPTH: usize = 4;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum SkillSource {
    Project,
    User,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Skill {
    pub name: String,
    pub description: String,
    /// Path of the `SKILL.md` file.
    pub path: PathBuf,
    /// Directory containing `SKILL.md`.
    pub dir: PathBuf,
    pub source: SkillSource,
}

/// Splits `content` into (frontmatter text, body). Without a leading `---`
/// line the frontmatter is empty and the body is the whole content.
pub(crate) fn split_frontmatter(content: &str) -> (String, &str) {
    let content = content.strip_prefix('\u{feff}').unwrap_or(content);
    let mut lines = content.split_inclusive('\n');
    let Some(first) = lines.next() else {
        return (String::new(), content);
    };
    if first.trim_end() != "---" {
        return (String::new(), content);
    }
    let mut consumed = first.len();
    let mut front = String::new();
    for line in lines {
        consumed += line.len();
        if line.trim_end() == "---" {
            return (front, &content[consumed..]);
        }
        front.push_str(line.trim_end_matches(['\r', '\n']));
        front.push('\n');
    }
    // Unterminated frontmatter: treat the whole file as body.
    (String::new(), content)
}

fn unquote(value: &str) -> String {
    let value = value.trim();
    for quote in ['"', '\''] {
        if value.len() >= 2 && value.starts_with(quote) && value.ends_with(quote) {
            return value[1..value.len() - 1].to_owned();
        }
    }
    value.to_owned()
}

/// Returns the value of top-level `key:` supporting quoted scalars, block
/// scalars (`>`, `|`) and plain continuation lines.
pub(crate) fn frontmatter_value(front: &str, key: &str) -> Option<String> {
    let lines: Vec<&str> = front.lines().collect();
    let prefix = format!("{key}:");
    let index = lines.iter().position(|line| line.starts_with(&prefix))?;
    let rest = lines[index][prefix.len()..].trim();
    let mut continuation = Vec::new();
    for line in &lines[index + 1..] {
        if line.trim().is_empty() {
            continuation.push("");
        } else if line.starts_with([' ', '\t']) {
            continuation.push(line.trim());
        } else {
            break;
        }
    }
    while continuation.last() == Some(&"") {
        continuation.pop();
    }
    match rest.chars().next() {
        Some('>') => Some(continuation.join(" ").trim().to_owned()),
        Some('|') => Some(continuation.join("\n").trim().to_owned()),
        _ => {
            let mut value = unquote(rest);
            for line in continuation.iter().filter(|line| !line.is_empty()) {
                value.push(' ');
                value.push_str(line);
            }
            Some(value)
        }
    }
}

fn parse_skill(path: &Path, source: SkillSource) -> Option<Skill> {
    let meta = std::fs::metadata(path).ok()?;
    if !meta.is_file() || meta.len() > MAX_SKILL_FILE_BYTES {
        return None;
    }
    let content = std::fs::read_to_string(path).ok()?;
    let dir = path.parent()?.to_path_buf();
    let (front, _) = split_frontmatter(&content);
    let folder = dir.file_name()?.to_string_lossy().into_owned();
    let name = frontmatter_value(&front, "name")
        .filter(|name| !name.is_empty())
        .unwrap_or(folder);
    let description = frontmatter_value(&front, "description").unwrap_or_default();
    Some(Skill {
        name,
        description,
        path: path.to_path_buf(),
        dir,
        source,
    })
}

fn scan_dir(root: &Path, source: SkillSource, out: &mut Vec<Skill>) {
    let Ok(entries) = std::fs::read_dir(root) else {
        return;
    };
    let mut dirs: Vec<PathBuf> = entries
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| path.is_dir())
        .collect();
    dirs.sort();
    for dir in dirs {
        if let Some(skill) = parse_skill(&dir.join("SKILL.md"), source) {
            out.push(skill);
        }
    }
}

/// Discovers skills. Project skills win over user skills on name clash; among
/// project dirs the earlier one (`.omnia`, `.claude`, `.agents`) wins.
pub fn discover_skills(workspace: &Path, user_dirs: &[PathBuf]) -> Vec<Skill> {
    let mut found = Vec::new();
    for sub in [".omnia/skills", ".claude/skills", ".agents/skills"] {
        scan_dir(&workspace.join(sub), SkillSource::Project, &mut found);
    }
    for dir in user_dirs {
        scan_dir(dir, SkillSource::User, &mut found);
    }
    let mut seen = HashSet::new();
    let mut skills: Vec<Skill> = found
        .into_iter()
        .filter(|skill| seen.insert(skill.name.clone()))
        .collect();
    skills.sort_by(|a, b| a.name.cmp(&b.name));
    skills
}

/// [`discover_skills`] plus the `skills/` folders of enabled plugins, which
/// rank below workspace and user skills on a name clash.
pub fn discover_skills_with_plugins(
    workspace: &Path,
    user_dirs: &[PathBuf],
    plugin_dirs: &[PathBuf],
) -> Vec<Skill> {
    let mut dirs = user_dirs.to_vec();
    dirs.extend_from_slice(plugin_dirs);
    discover_skills(workspace, &dirs)
}

fn truncate_chars(text: &str, max: usize) -> String {
    if text.chars().count() <= max {
        return text.to_owned();
    }
    let mut out: String = text.chars().take(max).collect();
    out.push('…');
    out
}

pub fn skills_prompt_section(skills: &[Skill]) -> String {
    if skills.is_empty() {
        return String::new();
    }
    let mut out = String::from(
        "# Skills\n\nSkills are packaged instructions for specific kinds of tasks. When the \
         user's task matches a skill below, call the `skill` tool with its name to load the \
         full instructions before acting.\n\n",
    );
    for skill in skills {
        let description =
            truncate_chars(&skill.description.replace('\n', " "), MAX_DESCRIPTION_CHARS);
        out.push_str(&format!("- {}: {}\n", skill.name, description));
    }
    out
}

fn list_files(dir: &Path) -> Vec<String> {
    fn walk(root: &Path, dir: &Path, depth: usize, out: &mut Vec<String>) {
        if depth > MAX_WALK_DEPTH || out.len() >= MAX_LISTED_FILES {
            return;
        }
        let Ok(entries) = std::fs::read_dir(dir) else {
            return;
        };
        let mut paths: Vec<PathBuf> = entries.filter_map(Result::ok).map(|e| e.path()).collect();
        paths.sort();
        for path in paths {
            if out.len() >= MAX_LISTED_FILES {
                return;
            }
            if path.is_dir() {
                walk(root, &path, depth + 1, out);
            } else if let Ok(relative) = path.strip_prefix(root) {
                let relative = relative.to_string_lossy().replace('\\', "/");
                if relative != "SKILL.md" {
                    out.push(relative);
                }
            }
        }
    }
    let mut out = Vec::new();
    walk(dir, dir, 0, &mut out);
    out
}

/// Loads a skill's instructions on demand.
pub struct SkillTool {
    skills: Vec<Skill>,
}

impl SkillTool {
    pub fn new(skills: Vec<Skill>) -> Self {
        Self { skills }
    }
}

#[async_trait]
impl Tool for SkillTool {
    fn spec(&self) -> ToolSpec {
        ToolSpec {
            name: "skill".to_owned(),
            description: "Load a skill's full instructions by name. Call this before acting on a \
                          task that matches one of the available skills."
                .to_owned(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Skill name"},
                    "args": {"type": "string", "description": "Optional arguments for the skill"}
                },
                "required": ["name"]
            }),
        }
    }

    fn effect(&self) -> EffectClass {
        EffectClass::ReadWorkspace
    }

    fn describe(&self, input: &Value) -> String {
        format!(
            "Load skill `{}`",
            input.get("name").and_then(Value::as_str).unwrap_or("?")
        )
    }

    async fn call(&self, _ctx: &ToolContext, input: Value) -> HarnessResult<ToolOutput> {
        let name = input
            .get("name")
            .and_then(Value::as_str)
            .ok_or_else(|| HarnessError::InvalidInput("`name` is required".to_owned()))?;
        let args = input
            .get("args")
            .and_then(Value::as_str)
            .filter(|a| !a.is_empty());
        let Some(skill) = self.skills.iter().find(|skill| skill.name == name) else {
            let names: Vec<&str> = self.skills.iter().map(|s| s.name.as_str()).collect();
            return Ok(ToolOutput::error(format!(
                "Unknown skill `{name}`. Available skills: {}",
                if names.is_empty() {
                    "(none)".to_owned()
                } else {
                    names.join(", ")
                }
            )));
        };
        let content = match std::fs::read_to_string(&skill.path) {
            Ok(content) => content,
            Err(error) => {
                return Ok(ToolOutput::error(format!(
                    "Could not read {}: {error}",
                    skill.path.display()
                )))
            }
        };
        let (_, body) = split_frontmatter(&content);
        let mut out = format!("Base directory for this skill: {}\n\n", skill.dir.display());
        out.push_str(body.trim_start_matches(['\r', '\n']));
        if let Some(args) = args {
            out.push_str(&format!("\n\nArguments: {args}\n"));
        }
        let files = list_files(&skill.dir);
        if !files.is_empty() {
            out.push_str("\n\nFiles in this skill directory:\n");
            for file in files {
                out.push_str(&format!("- {file}\n"));
            }
        }
        Ok(ToolOutput::text(out))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn write_skill(root: &Path, sub: &str, folder: &str, content: &str) {
        let dir = root.join(sub).join(folder);
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(dir.join("SKILL.md"), content).unwrap();
    }

    #[test]
    fn parses_frontmatter_variants() {
        let tmp = tempfile::tempdir().unwrap();
        write_skill(
            tmp.path(),
            ".omnia/skills",
            "a",
            "---\nname: alpha\ndescription: \"Quoted: yes\"\n---\nbody",
        );
        write_skill(
            tmp.path(),
            ".omnia/skills",
            "b",
            "---\ndescription: >\n  folded one\n  folded two\n---\nbody",
        );
        write_skill(tmp.path(), ".claude/skills", "c", "no frontmatter");
        let skills = discover_skills(tmp.path(), &[]);
        let names: Vec<_> = skills.iter().map(|s| s.name.as_str()).collect();
        assert_eq!(names, ["alpha", "b", "c"]);
        assert_eq!(skills[0].description, "Quoted: yes");
        assert_eq!(skills[1].description, "folded one folded two");
        assert_eq!(skills[2].description, "");
    }

    #[test]
    fn project_wins_and_big_files_skipped() {
        let tmp = tempfile::tempdir().unwrap();
        let user = tempfile::tempdir().unwrap();
        write_skill(
            tmp.path(),
            ".agents/skills",
            "x",
            "---\nname: dup\ndescription: project\n---\n",
        );
        write_skill(
            user.path(),
            "",
            "x",
            "---\nname: dup\ndescription: user\n---\n",
        );
        write_skill(
            user.path(),
            "",
            "big",
            &format!("---\nname: big\n---\n{}", "a".repeat(300_000)),
        );
        let skills = discover_skills(tmp.path(), &[user.path().to_path_buf()]);
        assert_eq!(skills.len(), 1);
        assert_eq!(skills[0].description, "project");
        assert_eq!(skills[0].source, SkillSource::Project);
    }

    #[test]
    fn prompt_section_truncates() {
        assert_eq!(skills_prompt_section(&[]), "");
        let skill = Skill {
            name: "n".into(),
            description: "d".repeat(500),
            path: PathBuf::new(),
            dir: PathBuf::new(),
            source: SkillSource::User,
        };
        let section = skills_prompt_section(&[skill]);
        assert!(section.starts_with("# Skills"));
        assert!(section.contains("`skill` tool"));
        assert!(section
            .lines()
            .any(|l| l.starts_with("- n: ") && l.chars().count() < 320));
    }

    #[tokio::test]
    async fn skill_tool_loads_and_errors() {
        let tmp = tempfile::tempdir().unwrap();
        write_skill(
            tmp.path(),
            ".omnia/skills",
            "demo",
            "---\nname: demo\ndescription: d\n---\n# Body\nuse scripts/run.sh",
        );
        let dir = tmp.path().join(".omnia/skills/demo");
        std::fs::create_dir_all(dir.join("scripts")).unwrap();
        std::fs::write(dir.join("scripts/run.sh"), "echo").unwrap();
        let tool = SkillTool::new(discover_skills(tmp.path(), &[]));
        let ctx = ToolContext::new(tmp.path());
        let out = tool
            .call(&ctx, json!({"name": "demo", "args": "x"}))
            .await
            .unwrap();
        assert!(!out.is_error);
        let crate::Block::Text { text } = &out.content[0] else {
            panic!()
        };
        assert!(text.starts_with("Base directory for this skill:"));
        assert!(text.contains("# Body"));
        assert!(!text.contains("description: d"));
        assert!(text.contains("- scripts/run.sh"));
        assert!(text.contains("Arguments: x"));
        let out = tool.call(&ctx, json!({"name": "nope"})).await.unwrap();
        assert!(out.is_error);
        let crate::Block::Text { text } = &out.content[0] else {
            panic!()
        };
        assert!(text.contains("demo"));
    }
}
