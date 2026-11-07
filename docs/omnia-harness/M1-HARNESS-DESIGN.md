# M1 — Omnia Harness (Rust) · Thiết kế

Trạng thái: bản nháp v1 (2026-10-30). Danh mục tính năng: `FEATURES.md`.

## 1. Vị trí trong codebase

Hiện `omnia_lib` gắn chặt với Tauri `AppState` và `storage.rs` (38k dòng). Harness mới
**không** viết thêm vào hai chỗ đó:

```
src-tauri/
  Cargo.toml                 → thành workspace
  crates/omnia-harness/      → crate thuần Rust, KHÔNG phụ thuộc tauri
    src/model.rs             kiểu trung lập: Message, Block, ToolSpec, StreamEvent
    src/provider/            anthropic.rs, openai_responses.rs, openai_chat.rs, gemini.rs
    src/agent.rs             vòng lặp agent
    src/tools/               read, write, edit, glob, grep, shell, web_fetch, web_search, todo, task, ask_user
    src/permission.rs        chế độ + luật + hàng chờ duyệt
    src/context.rs           đếm token, nén, file quy tắc dự án, @mention
    src/subagent.rs          Task tool, lập lịch, worktree
    src/mcp.rs               client MCP (crate `rmcp`)
    src/skills.rs, hooks.rs
    src/store.rs             trait lưu sự kiện (impl SQLite nằm ở app)
  src/harness_bridge.rs      Tauri commands + emit sự kiện + impl store trên SQLite
```

Tái dùng từ code cũ (chuyển sang module dùng chung, không nhân bản):
`apply_auth`, `validated_client_for_profile`, `validate_resolved_addresses`,
`load_credential*`, `redact_sensitive_text` (provider_gateway.rs),
`ExactApprovalBroker` (exact_approval_broker.rs) cho duyệt gắn với hash tham số,
`run_journal` cho replay.

Tham khảo hợp lệ: `codex-rs` (Apache-2.0, được dùng lại code kèm NOTICE).
Không dùng: `research/upstreams/claude-code` (mã nguồn rò rỉ, độc quyền).

## 2. Mô hình dữ liệu trung lập

```rust
enum Block { Text(String), Image{media, data}, Thinking{text, signature},
             ToolUse{id, name, input: Value}, ToolResult{id, content: Vec<Block>, is_error} }
struct Message { role: Role, content: Vec<Block> }
enum StreamEvent { TextDelta, ThinkingDelta, ToolUseStart{id,name}, ToolInputDelta{id, json},
                   ToolUseEnd{id}, Usage(Usage), Stop(StopReason) }
```
Mỗi adapter chuyển 2 chiều Message ⇄ wire format và SSE ⇄ StreamEvent.
Đổi model giữa phiên = cùng lịch sử `Vec<Message>`, adapter khác.

## 3. Vòng lặp agent

```
loop {
  req = context.compile(history, tools, system)        // nén nếu > ngưỡng
  stream → emit delta lên UI, gom ToolUse
  if stop != tool_use → break
  for call in calls: permission.check(call) → Allow | Ask | Deny(lý do do user đặt)
  chạy: tool chỉ-đọc song song, tool ghi/chạy tuần tự
  history += ToolResult; chèn tin nhắn steer đang chờ
  dừng khi: cancel, max_turns (user đặt), ngân sách (user đặt)
}
```
Mọi bước ghi sự kiện: `turn_started, delta, tool_proposed, approval_requested,
approval_decided, tool_started, tool_output, tool_completed, turn_completed` → replay sau crash.

## 4. Quyền — người dùng là luật

Chế độ: `ask_all · ask_writes (mặc định) · auto · full`. Luật allow/deny theo
tool + glob tham số (`Bash(git *)`, `Write(src/**)`, `WebFetch(domain:*.github.com)`),
cấp phiên/dự án/toàn cục. Không có danh sách cấm cứng trong code.
`full` không hỏi gì; chỉ còn audit log + checkpoint để hoàn tác.

## 5. Tauri API

Commands: `agent_session_create/list/read/delete`, `agent_send`, `agent_steer`,
`agent_interrupt`, `agent_approval_decide`, `agent_rewind`, `agent_fork`,
`agent_set_model`, `agent_set_permission_mode`.
Event: `omnia://agent/{session_id}` mang `StreamEvent` + sự kiện tool/duyệt.

## 6. Chia việc cho subagent (tuần tự theo vùng file, không chồng nhau)

| Gói | Nội dung | Kiểm thử |
|---|---|---|
| H1 | workspace + crate, model.rs, adapter Anthropic + OpenAI Responses/Chat + Gemini có tool calling | test SSE giả lập từng hãng |
| H2 | tools file/search/shell/web | test trên thư mục tạm |
| H3 | agent.rs + permission.rs + store trait | test vòng lặp với provider giả |
| H4 | harness_bridge.rs + UI chat tối thiểu (thẻ tool, thẻ duyệt) | chạy app thật với 1 provider |
| H5 | subagent, MCP, skills, hooks, nén ngữ cảnh, checkpoint/rewind | test + kịch bản eval |

Mỗi gói: Sonnet viết → Opus review → mới sang gói kế.
