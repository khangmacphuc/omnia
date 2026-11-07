[CmdletBinding()]
param(
    # Do not evaluate $PSScriptRoot in a parameter default. PowerShell binds
    # parameter defaults before the script scope is initialized, so that
    # automatic variable can be empty when this file is invoked by path.
    [string]$SpecRoot = '',
    [int]$MaxMarkdownLines = 400
)

$ErrorActionPreference = 'Stop'
$failures = [System.Collections.Generic.List[string]]::new()

if ([string]::IsNullOrWhiteSpace($SpecRoot)) {
    $scriptDirectory = if (-not [string]::IsNullOrWhiteSpace($PSScriptRoot)) {
        $PSScriptRoot
    } elseif (-not [string]::IsNullOrWhiteSpace($PSCommandPath)) {
        Split-Path -Parent $PSCommandPath
    } else {
        (Get-Location).Path
    }
    $SpecRoot = Split-Path -Parent $scriptDirectory
}

if (-not (Test-Path -LiteralPath $SpecRoot -PathType Container)) {
    throw "Spec root does not exist: $SpecRoot"
}

$resolvedSpecRoot = (Resolve-Path -LiteralPath $SpecRoot).Path

function Get-RelativeSpecPath {
    param([string]$FullPath)

    # PowerShell 7/.NET Core exposes Path.GetRelativePath, but the supported
    # Windows PowerShell 5.1 runtime is backed by .NET Framework where that
    # API does not exist.  Keep one deterministic path contract for both
    # runtimes instead of making validation depend on the host shell version.
    $relativePathMethod = [IO.Path].GetMethod(
        'GetRelativePath',
        [Type[]]@([string], [string])
    )
    if ($null -ne $relativePathMethod) {
        return $relativePathMethod.Invoke($null, @($resolvedSpecRoot, $FullPath)).Replace('\', '/')
    }

    # Uri.MakeRelativeUri is available on .NET Framework.  The trailing
    # separator is important: without it, a directory is treated as a file
    # and the first path segment can be dropped from the relative result.
    $baseDirectory = $resolvedSpecRoot.TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
    $baseUri = [Uri]::new($baseDirectory)
    $fullUri = [Uri]::new($FullPath)
    return [Uri]::UnescapeDataString($baseUri.MakeRelativeUri($fullUri).ToString()).Replace('\', '/')
}

function Test-ResolvablePath {
    param(
        [string]$Path,
        [string]$Label,
        [string]$BaseDirectory = $resolvedSpecRoot
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        $failures.Add("Empty $Label path")
        return $false
    }

    $candidate = if ([IO.Path]::IsPathRooted($Path)) {
        $Path
    } else {
        [IO.Path]::GetFullPath([IO.Path]::Combine($BaseDirectory, $Path))
    }

    if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
        $failures.Add("$Label path missing: $Path")
        return $false
    }

    return $true
}

function Get-FrontmatterValue {
    param(
        [string[]]$Lines,
        [int]$ClosingIndex,
        [string]$Name
    )

    $expression = '^' + [regex]::Escape($Name) + ':\s*(.+)$'
    $line = $Lines[1..($ClosingIndex - 1)] |
        Where-Object { $_ -match $expression } |
        Select-Object -First 1
    if (-not $line) {
        return $null
    }
    return (($line -replace $expression, '$1').Trim())
}

function Test-JsonField {
    param(
        [object]$Object,
        [string]$Field,
        [string]$Context
    )

    if ($null -eq $Object.PSObject.Properties[$Field]) {
        $failures.Add("Missing '$Field' in $Context")
        return $false
    }
    return $true
}

function Test-DependencyCycles {
    param(
        [hashtable]$Nodes,
        [string]$Label
    )

    $state = @{}
    $path = [System.Collections.Generic.List[string]]::new()
    $visit = $null
    $visit = {
        param([string]$NodeId)

        $nodeState = $state[$NodeId]
        if ($nodeState -eq 'visiting') {
            $start = $path.IndexOf($NodeId)
            $cycle = @($path.GetRange($start, $path.Count - $start)) + $NodeId
            $failures.Add("$Label dependency cycle: $($cycle -join ' -> ')")
            return
        }
        if ($nodeState -eq 'done') {
            return
        }

        $state[$NodeId] = 'visiting'
        $path.Add($NodeId)
        foreach ($dependency in @($Nodes[$NodeId].dependencies)) {
            $dependencyId = [string]$dependency
            if ($Nodes.ContainsKey($dependencyId)) {
                & $visit $dependencyId
            }
        }
        $null = $path.RemoveAt($path.Count - 1)
        $state[$NodeId] = 'done'
    }

    foreach ($nodeId in $Nodes.Keys | Sort-Object) {
        if ($state[$nodeId] -ne 'done') {
            & $visit ([string]$nodeId)
        }
    }
}

$manifest = $null
$manifestPath = Join-Path $resolvedSpecRoot 'manifest.json'
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    $failures.Add('Missing manifest.json')
} else {
    try {
        $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json

        $declaredAllFiles = @($manifest.allFiles)
        $duplicateManifestEntries = $declaredAllFiles |
            Group-Object |
            Where-Object { $_.Count -gt 1 }
        foreach ($duplicate in $duplicateManifestEntries) {
            $failures.Add("Duplicate manifest allFiles entry: $($duplicate.Name)")
        }

        # Keep the dedicated schema registry closed over the schema directory.
        # `allFiles` catches missing files globally, but without this check a
        # newly added JSON Schema can silently remain undiscoverable through
        # `manifest.schemas` even while the broader pack validator passes.
        $declaredSchemas = @($manifest.schemas)
        $duplicateSchemaEntries = $declaredSchemas |
            Group-Object |
            Where-Object { $_.Count -gt 1 }
        foreach ($duplicate in $duplicateSchemaEntries) {
            $failures.Add("Duplicate manifest schemas entry: $($duplicate.Name)")
        }
        $schemaDirectory = Join-Path $resolvedSpecRoot 'schemas'
        if (Test-Path -LiteralPath $schemaDirectory -PathType Container) {
            $discoveredSchemas = Get-ChildItem -LiteralPath $schemaDirectory -Recurse -File -Filter '*.schema.json' |
                ForEach-Object { Get-RelativeSpecPath -FullPath $_.FullName }
            foreach ($relativePath in $discoveredSchemas) {
                if ($relativePath -notin $declaredSchemas) {
                    $failures.Add("Schema file is absent from manifest schemas: $relativePath")
                }
            }
            foreach ($relativePath in $declaredSchemas) {
                if ($relativePath -notin $discoveredSchemas) {
                    $failures.Add("Manifest schemas entry does not exist: $relativePath")
                }
            }
        } elseif ($declaredSchemas.Count -gt 0) {
            $failures.Add("Manifest declares schemas but schema directory is missing: schemas")
        }

        $manifestPaths = [System.Collections.Generic.List[string]]::new()
        foreach ($path in @($manifest.requiredReading)) { $manifestPaths.Add([string]$path) }
        foreach ($path in @($manifest.schemas)) { $manifestPaths.Add([string]$path) }
        foreach ($path in @($manifest.bundles.PSObject.Properties.Value)) { $manifestPaths.Add([string]$path) }
        foreach ($path in @($manifest.allFiles)) { $manifestPaths.Add([string]$path) }
        $manifestPaths.Add([string]$manifest.entry)
        $manifestPaths.Add([string]$manifest.executionPrompt)
        if ($null -ne $manifest.readingProtocol) {
            foreach ($phase in $manifest.readingProtocol.PSObject.Properties) {
                foreach ($path in @($phase.Value)) { $manifestPaths.Add([string]$path) }
            }
        }

        foreach ($relativePath in $manifestPaths | Sort-Object -Unique) {
            Test-ResolvablePath -Path $relativePath -Label 'Manifest' | Out-Null
        }

        $discoveredFiles = Get-ChildItem -LiteralPath $resolvedSpecRoot -Recurse -File |
            ForEach-Object { Get-RelativeSpecPath -FullPath $_.FullName }
        foreach ($relativePath in $discoveredFiles) {
            if ($relativePath -notin $declaredAllFiles) {
                $failures.Add("Spec file is absent from manifest allFiles: $relativePath")
            }
        }
        foreach ($relativePath in $declaredAllFiles) {
            if ($relativePath -notin $discoveredFiles) {
                $failures.Add("Manifest allFiles entry does not exist: $relativePath")
            }
        }
    } catch {
        $failures.Add("manifest.json is invalid: $($_.Exception.Message)")
    }
}

$jsonFiles = Get-ChildItem -LiteralPath $resolvedSpecRoot -Recurse -File -Filter '*.json'
foreach ($file in $jsonFiles) {
    try {
        $rawJson = Get-Content -LiteralPath $file.FullName -Raw
        $json = $rawJson | ConvertFrom-Json
        if ($null -ne $json.'$schema' -and -not ([string]$json.'$schema' -match '^[a-z][a-z0-9+.-]*:')) {
            $schemaPath = ([string]$json.'$schema').Split('#')[0]
            if ($schemaPath) {
                Test-ResolvablePath -Path $schemaPath -Label "JSON schema in $(Get-RelativeSpecPath -FullPath $file.FullName)" -BaseDirectory $file.Directory.FullName | Out-Null
            }
        }
        foreach ($match in [regex]::Matches($rawJson, '"\$ref"\s*:\s*"(?<target>[^"]+)"')) {
            $reference = $match.Groups['target'].Value
            if ($reference -match '^(#|[a-z][a-z0-9+.-]*:)') { continue }
            $referencePath = ([Uri]::UnescapeDataString($reference)).Split('#')[0]
            if ($referencePath) {
                Test-ResolvablePath -Path $referencePath -Label "JSON reference in $(Get-RelativeSpecPath -FullPath $file.FullName)" -BaseDirectory $file.Directory.FullName | Out-Null
            }
        }
    } catch {
        $failures.Add("Invalid JSON: $($file.FullName): $($_.Exception.Message)")
    }
}

$frontmatterByRelative = @{}
$markdownByRelative = @{}
$ids = @{}
$markdownFiles = Get-ChildItem -LiteralPath $resolvedSpecRoot -Recurse -File -Filter '*.md'
foreach ($file in $markdownFiles) {
    $lines = @(Get-Content -LiteralPath $file.FullName)
    $relative = Get-RelativeSpecPath -FullPath $file.FullName
    $markdownByRelative[$relative] = @{ File = $file; Lines = $lines }

    if ($lines.Count -eq 0) {
        $failures.Add("Empty Markdown file: $relative")
        continue
    }

    if ($lines[0] -ne '---') {
        $failures.Add("Missing frontmatter: $relative")
        continue
    }

    $closing = -1
    for ($index = 1; $index -lt [Math]::Min($lines.Count, 40); $index++) {
        if ($lines[$index] -eq '---') {
            $closing = $index
            break
        }
    }
    if ($closing -lt 0) {
        $failures.Add("Unclosed frontmatter: $relative")
        continue
    }

    $id = Get-FrontmatterValue -Lines $lines -ClosingIndex $closing -Name 'id'
    if (-not $id) {
        $failures.Add("Missing id in frontmatter: $relative")
    } elseif ($ids.ContainsKey($id)) {
        $failures.Add("Duplicate id '$id': $relative and $($ids[$id])")
    } else {
        $ids[$id] = $relative
    }

    $frontmatterByRelative[$relative] = @{
        Id = $id
        Status = Get-FrontmatterValue -Lines $lines -ClosingIndex $closing -Name 'status'
        Version = Get-FrontmatterValue -Lines $lines -ClosingIndex $closing -Name 'version'
        LastReviewed = Get-FrontmatterValue -Lines $lines -ClosingIndex $closing -Name 'last_reviewed'
        Supersedes = Get-FrontmatterValue -Lines $lines -ClosingIndex $closing -Name 'supersedes'
        RequirementsRegistryRevision = Get-FrontmatterValue -Lines $lines -ClosingIndex $closing -Name 'requirements_registry_revision'
    }

    if ($lines.Count -gt $MaxMarkdownLines) {
        $failures.Add("Markdown file exceeds $MaxMarkdownLines lines: $relative ($($lines.Count))")
    }

    foreach ($match in [regex]::Matches(($lines -join "`n"), '\]\((?<target>[^)\s]+)(?:\s+[^)]*)?\)')) {
        $target = $match.Groups['target'].Value.Trim('<', '>')
        if ($target -match '^(#|https?:|mailto:|data:)') { continue }
        $targetPath = ([Uri]::UnescapeDataString($target)).Split('#')[0]
        if (-not $targetPath) { continue }
        Test-ResolvablePath -Path $targetPath -Label "Markdown link in $relative" -BaseDirectory $file.Directory.FullName | Out-Null
    }
}

if ($manifest) {
    $canonicalPrompt = [string]$manifest.executionPrompt
    $promptCount = @($frontmatterByRelative.GetEnumerator() |
        Where-Object { $_.Value.Status -eq 'operational-prompt' }).Count
    if ($promptCount -ne 1) {
        $failures.Add("Expected exactly one operational-prompt, found $promptCount")
    }
    if ($frontmatterByRelative.ContainsKey($canonicalPrompt) -and $frontmatterByRelative[$canonicalPrompt].Status -ne 'operational-prompt') {
        $failures.Add("Manifest executionPrompt is not the canonical operational-prompt: $canonicalPrompt")
    }

    foreach ($navigation in @('00-START-HERE.md', 'goal/README.md', 'delivery/README.md')) {
        if (-not $markdownByRelative.ContainsKey($navigation)) { continue }
        $content = $markdownByRelative[$navigation].Lines -join "`n"
        if ($navigation -eq 'delivery/README.md') {
            if ($content -notmatch 'goal/00-copy-ready-prompt\.md') {
                $failures.Add("Navigation file does not route to canonical prompt: $navigation")
            }
        } elseif ($navigation -eq 'goal/README.md') {
            if ($content -notmatch '00-copy-ready-prompt\.md') {
                $failures.Add("Navigation file does not route to canonical prompt: $navigation")
            }
        } elseif ($content -notmatch [regex]::Escape($canonicalPrompt)) {
            $failures.Add("Navigation file does not route to canonical prompt: $navigation")
        }
    }

    if ($markdownByRelative.ContainsKey($canonicalPrompt)) {
        $canonicalContent = $markdownByRelative[$canonicalPrompt].Lines -join "`n"
        if ($canonicalContent -match '(?im)^##\s+Current continuation anchor') {
            $failures.Add("Mutable continuation anchor is embedded in canonical prompt: $canonicalPrompt")
        }

        # Keep the portable goal payload synchronized with the executable
        # multimodal bridge enum.  The prompt is copied into fresh workers, so
        # an enum drift here can cause a worker to emit an unparseable plan or
        # misclassify a grounded representation as an execution mode.
        $bridgeSchemaPath = Join-Path $resolvedSpecRoot 'schemas/modality-bridge-plan.schema.json'
        if (Test-Path -LiteralPath $bridgeSchemaPath -PathType Leaf) {
            try {
                $bridgeSchema = Get-Content -LiteralPath $bridgeSchemaPath -Raw | ConvertFrom-Json
                foreach ($resolvedMode in @($bridgeSchema.properties.resolvedMode.enum)) {
                    $modeToken = '`' + [string]$resolvedMode + '`'
                    if (-not $canonicalContent.Contains($modeToken)) {
                        $failures.Add("Canonical prompt omits multimodal resolvedMode '$resolvedMode'")
                    }
                }
                if ($canonicalContent -notmatch '(?s)grounded-surrogate.{0,160}representation') {
                    $failures.Add('Canonical prompt does not distinguish grounded-surrogate representation from executable bridge modes')
                }
            } catch {
                $failures.Add("Unable to inspect multimodal bridge enum for canonical prompt: $($_.Exception.Message)")
            }
        }
    }
}

foreach ($entry in $frontmatterByRelative.GetEnumerator()) {
    if ($entry.Key -like 'goal/*.md' -and $entry.Key -notin @('goal/README.md') -and $entry.Value.Status -eq 'normative-target') {
        foreach ($requiredField in @('Version', 'LastReviewed', 'Supersedes', 'RequirementsRegistryRevision')) {
            if (-not $entry.Value[$requiredField]) {
                $failures.Add("Normative goal file is missing $requiredField metadata: $($entry.Key)")
            }
        }
    }
}

$requirementsPath = Join-Path $resolvedSpecRoot 'goal/requirements.json'
$ledgerPath = Join-Path $resolvedSpecRoot 'delivery/capability-ledger.json'
if ((Test-Path -LiteralPath $requirementsPath -PathType Leaf) -and (Test-Path -LiteralPath $ledgerPath -PathType Leaf)) {
    try {
        $registry = Get-Content -LiteralPath $requirementsPath -Raw | ConvertFrom-Json
        $ledger = Get-Content -LiteralPath $ledgerPath -Raw | ConvertFrom-Json
        if ($registry.schemaVersion -ne 1) {
            $failures.Add("Unsupported goal requirements schemaVersion: $($registry.schemaVersion)")
        }
        if ([string]::IsNullOrWhiteSpace([string]$registry.registryRevision)) {
            $failures.Add('Goal requirements registryRevision is missing')
        }
        if ($ledger.schemaVersion -ne 1) {
            $failures.Add("Unsupported capability ledger schemaVersion: $($ledger.schemaVersion)")
        }
        if ([string]::IsNullOrWhiteSpace([string]$ledger.ledgerRevision)) {
            $failures.Add('Capability ledger ledgerRevision is missing')
        }

        $acceptanceCatalogPath = 'delivery/acceptance-gates.md'
        $acceptanceCatalogContent = $null
        if ($markdownByRelative.ContainsKey($acceptanceCatalogPath)) {
            $acceptanceCatalogContent = $markdownByRelative[$acceptanceCatalogPath].Lines -join "`n"
        } else {
            $failures.Add("Missing atomic acceptance catalog: $acceptanceCatalogPath")
        }

        $capabilityById = @{}
        foreach ($capability in @($ledger.capabilities)) {
            if (-not (Test-JsonField -Object $capability -Field 'capabilityId' -Context 'capability ledger row')) { continue }
            $capabilityId = [string]$capability.capabilityId
            if ($capabilityById.ContainsKey($capabilityId)) {
                $failures.Add("Duplicate capability ID: $capabilityId")
            } else {
                $capabilityById[$capabilityId] = $capability
            }
            foreach ($field in @('title', 'status', 'canonicalSpec', 'requirementIds', 'dependencies', 'securityClass', 'implementationModules', 'schemas', 'tests', 'evidence', 'currentLimitation', 'nextAction')) {
                Test-JsonField -Object $capability -Field $field -Context "capability $capabilityId" | Out-Null
            }
            if ($capability.canonicalSpec) {
                Test-ResolvablePath -Path ([string]$capability.canonicalSpec) -Label "Capability canonical spec for $capabilityId" | Out-Null
            }
            foreach ($schema in @($capability.schemas)) {
                Test-ResolvablePath -Path ([string]$schema) -Label "Capability schema for $capabilityId" | Out-Null
            }
        }

        $requirementById = @{}
        $goalDocumentsWithRequirement = @{}
        $acceptanceOwnerById = @{}
        foreach ($requirement in @($registry.requirements)) {
            if (-not (Test-JsonField -Object $requirement -Field 'requirementId' -Context 'goal requirement')) { continue }
            $requirementId = [string]$requirement.requirementId
            if ($requirementById.ContainsKey($requirementId)) {
                $failures.Add("Duplicate requirement ID: $requirementId")
            } else {
                $requirementById[$requirementId] = $requirement
            }
            foreach ($field in @('title', 'goalDocument', 'canonicalSpecs', 'dependencies', 'schemas', 'securityClass', 'acceptanceIds', 'coverageCapabilityId', 'targetStatus', 'supersedes')) {
                Test-JsonField -Object $requirement -Field $field -Context "requirement $requirementId" | Out-Null
            }
            if ($requirement.goalDocument) {
                $goalDocument = [string]$requirement.goalDocument
                Test-ResolvablePath -Path $goalDocument -Label "Goal document for $requirementId" | Out-Null
                $goalDocumentsWithRequirement[$goalDocument] = $true
                if ($frontmatterByRelative.ContainsKey($goalDocument)) {
                    $documentRevision = [string]$frontmatterByRelative[$goalDocument].RequirementsRegistryRevision
                    if ($documentRevision -and $documentRevision -ne [string]$registry.registryRevision) {
                        $failures.Add("Goal document registry revision mismatch for $requirementId`: $goalDocument has $documentRevision, registry has $($registry.registryRevision)")
                    }
                }
            }
            foreach ($spec in @($requirement.canonicalSpecs)) {
                Test-ResolvablePath -Path ([string]$spec) -Label "Canonical spec for $requirementId" | Out-Null
            }
            foreach ($schema in @($requirement.schemas)) {
                Test-ResolvablePath -Path ([string]$schema) -Label "Requirement schema for $requirementId" | Out-Null
            }
            if ($requirement.coverageCapabilityId -and -not $capabilityById.ContainsKey([string]$requirement.coverageCapabilityId)) {
                $failures.Add("Requirement $requirementId references missing capability $($requirement.coverageCapabilityId)")
            }
            if (@($requirement.acceptanceIds).Count -eq 0) {
                $failures.Add("Requirement $requirementId has no acceptance ID")
            } else {
                foreach ($acceptanceId in @($requirement.acceptanceIds)) {
                    $acceptanceKey = [string]$acceptanceId
                    if ($acceptanceOwnerById.ContainsKey($acceptanceKey)) {
                        $failures.Add("Acceptance ID is owned by multiple requirements: $acceptanceKey ($($acceptanceOwnerById[$acceptanceKey]) and $requirementId)")
                    } else {
                        $acceptanceOwnerById[$acceptanceKey] = $requirementId
                    }
                    if ($acceptanceCatalogContent) {
                        $acceptancePattern = '(?m)^\|\s*' + [regex]::Escape($acceptanceKey) + '\s*\|'
                        $acceptanceRowCount = [regex]::Matches($acceptanceCatalogContent, $acceptancePattern).Count
                        if ($acceptanceRowCount -ne 1) {
                            $failures.Add("Acceptance ID must resolve to exactly one catalog row: $acceptanceKey (found $acceptanceRowCount)")
                        }
                    }
                }
            }
            if ($requirement.securityClass -in @('browser-machine', 'privileged')) {
                $hasBoundary = @($requirement.canonicalSpecs | Where-Object { $_ -match '^(security|runtimes)/' }).Count -gt 0
                if (-not $hasBoundary) {
                    $failures.Add("Security-sensitive requirement lacks security/runtime canonical contract: $requirementId")
                }
            }
        }

        foreach ($requirement in @($registry.requirements)) {
            foreach ($relatedRequirementId in @($requirement.dependencies) + @($requirement.supersedes)) {
                if (-not $requirementById.ContainsKey([string]$relatedRequirementId)) {
                    $failures.Add("Requirement $($requirement.requirementId) references unknown requirement $relatedRequirementId")
                }
            }
        }
        Test-DependencyCycles -Nodes $requirementById -Label 'Requirement'

        foreach ($capability in @($ledger.capabilities)) {
            foreach ($dependencyId in @($capability.dependencies)) {
                if (-not $capabilityById.ContainsKey([string]$dependencyId)) {
                    $failures.Add("Capability $($capability.capabilityId) references unknown capability $dependencyId")
                }
            }
            foreach ($requirementId in @($capability.requirementIds)) {
                if (-not $requirementById.ContainsKey([string]$requirementId)) {
                    $failures.Add("Capability $($capability.capabilityId) references unknown requirement $requirementId")
                    continue
                }
                $requirement = $requirementById[[string]$requirementId]
                if ([string]$requirement.coverageCapabilityId -ne [string]$capability.capabilityId) {
                    $failures.Add("Capability $($capability.capabilityId) is not the coverage capability for requirement $requirementId")
                }
                if ([string]$capability.canonicalSpec -notin @($requirement.canonicalSpecs)) {
                    $failures.Add("Capability canonical spec is absent from requirement $requirementId`: $($capability.capabilityId) -> $($capability.canonicalSpec)")
                }
                if ([string]$capability.securityClass -ne [string]$requirement.securityClass) {
                    $failures.Add("Capability security class differs from requirement $requirementId`: $($capability.capabilityId)")
                }
                foreach ($schema in @($capability.schemas)) {
                    if ([string]$schema -notin @($requirement.schemas)) {
                        $failures.Add("Capability schema is absent from requirement $requirementId`: $($capability.capabilityId) -> $schema")
                    }
                }
            }
        }
        Test-DependencyCycles -Nodes $capabilityById -Label 'Capability'

        foreach ($requirement in @($registry.requirements)) {
            $coverageCapabilityId = [string]$requirement.coverageCapabilityId
            if ($capabilityById.ContainsKey($coverageCapabilityId) -and [string]$requirement.requirementId -notin @($capabilityById[$coverageCapabilityId].requirementIds)) {
                $failures.Add("Requirement $($requirement.requirementId) is missing its capability ledger backreference: $coverageCapabilityId")
            }
        }

        foreach ($capability in @($ledger.capabilities)) {
            if (@($capability.requirementIds).Count -eq 0) {
                $failures.Add("Capability $($capability.capabilityId) has no atomic requirement mapping")
            }
        }

        foreach ($entry in $frontmatterByRelative.GetEnumerator()) {
            if ($entry.Key -like 'goal/*.md' -and $entry.Key -notin @('goal/README.md', 'goal/00-copy-ready-prompt.md') -and $entry.Value.Status -eq 'normative-target' -and -not $goalDocumentsWithRequirement.ContainsKey($entry.Key)) {
                $failures.Add("Normative goal document has no atomic requirement mapping: $($entry.Key)")
            }
        }
    } catch {
        $failures.Add("Goal registry or capability ledger is invalid: $($_.Exception.Message)")
    }
} else {
    $failures.Add('Missing goal requirement registry or capability ledger')
}

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Output "FAIL - $_" }
    exit 1
}

Write-Output ("PASS - Omnia Ultra spec pack: {0} Markdown files, {1} JSON files, {2} unique document IDs, {3} requirements, {4} capability rows" -f
    $markdownFiles.Count, $jsonFiles.Count, $ids.Count, $registry.requirements.Count, $ledger.capabilities.Count)
