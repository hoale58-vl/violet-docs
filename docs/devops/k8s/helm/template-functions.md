# Template Functions Cheatsheet

Quick reference for Helm template functions, pipelines, and flow control.

## Function Syntax

```yaml
# Standard function call
{{ functionName arg1 arg2 }}

# Pipeline (recommended)
{{ arg1 | functionName }}

# Chained pipeline
{{ value | function1 | function2 | function3 }}

# With parentheses
{{ functionName (arg1) (arg2) }}
```

## String Functions

| Function | Usage | Description | Example |
|----------|-------|-------------|---------|
| `quote` | `{{ .value \| quote }}` | Add double quotes | `"value"` |
| `squote` | `{{ .value \| squote }}` | Add single quotes | `'value'` |
| `upper` | `{{ .value \| upper }}` | Convert to uppercase | `VALUE` |
| `lower` | `{{ .value \| lower }}` | Convert to lowercase | `value` |
| `title` | `{{ .value \| title }}` | Title case | `Value` |
| `untitle` | `{{ .value \| untitle }}` | Reverse title case | `value` |
| `repeat` | `{{ "x" \| repeat 3 }}` | Repeat string N times | `xxx` |
| `trim` | `{{ " value " \| trim }}` | Remove whitespace | `value` |
| `trimAll` | `{{ "-value-" \| trimAll "-" }}` | Trim specific chars | `value` |
| `trimPrefix` | `{{ "http://url" \| trimPrefix "http://" }}` | Remove prefix | `url` |
| `trimSuffix` | `{{ "file.txt" \| trimSuffix ".txt" }}` | Remove suffix | `file` |
| `trunc` | `{{ .value \| trunc 5 }}` | Truncate to N chars | First 5 chars |
| `abbrev` | `{{ .value \| abbrev 10 }}` | Abbreviate with ... | `value...` |
| `substr` | `{{ substr 0 5 .value }}` | Extract substring | Chars 0-5 |
| `nospace` | `{{ "a b c" \| nospace }}` | Remove all spaces | `abc` |
| `indent` | `{{ .value \| indent 4 }}` | Indent by N spaces | 4-space indent |
| `nindent` | `{{ .value \| nindent 4 }}` | Newline + indent | `\n    value` |
| `replace` | `{{ "a-b" \| replace "-" "_" }}` | Replace substring | `a_b` |
| `plural` | `{{ "ox" \| plural }}` | Pluralize word | `oxes` |
| `snakecase` | `{{ "FooBar" \| snakecase }}` | Snake case | `foo_bar` |
| `camelcase` | `{{ "foo-bar" \| camelcase }}` | Camel case | `FooBar` |
| `kebabcase` | `{{ "FooBar" \| kebabcase }}` | Kebab case | `foo-bar` |
| `swapcase` | `{{ "AbC" \| swapcase }}` | Swap case | `aBc` |
| `shuffle` | `{{ "hello" \| shuffle }}` | Shuffle characters | Random order |

## Type Conversion

| Function | Usage | Description | Example |
|----------|-------|-------------|---------|
| `toString` | `{{ 123 \| toString }}` | Convert to string | `"123"` |
| `toStrings` | `{{ list 1 2 \| toStrings }}` | Convert list to strings | `["1", "2"]` |
| `toJson` | `{{ .value \| toJson }}` | Convert to JSON | JSON string |
| `toPrettyJson` | `{{ .value \| toPrettyJson }}` | Pretty JSON | Formatted JSON |
| `toRawJson` | `{{ .value \| toRawJson }}` | Raw JSON (no escaping) | JSON string |
| `toYaml` | `{{ .value \| toYaml }}` | Convert to YAML | YAML string |
| `fromYaml` | `{{ .value \| fromYaml }}` | Parse YAML | Object |
| `fromJson` | `{{ .value \| fromJson }}` | Parse JSON | Object |
| `toToml` | `{{ .value \| toToml }}` | Convert to TOML | TOML string |
| `fromYamlArray` | `{{ .value \| fromYamlArray }}` | Parse YAML array | Array |
| `int` | `{{ "123" \| int }}` | Convert to int | `123` |
| `int64` | `{{ "123" \| int64 }}` | Convert to int64 | `123` |
| `float64` | `{{ "1.23" \| float64 }}` | Convert to float | `1.23` |
| `atoi` | `{{ "123" \| atoi }}` | ASCII to integer | `123` |

## Default Values

| Function | Usage | Description | Example |
|----------|-------|-------------|---------|
| `default` | `{{ .value \| default "fallback" }}` | Default if empty/nil | `fallback` if empty |
| `empty` | `{{ empty .value }}` | Check if empty | `true/false` |
| `coalesce` | `{{ coalesce .a .b .c "default" }}` | First non-empty value | First non-nil |
| `ternary` | `{{ ternary "yes" "no" .condition }}` | Ternary operator | `yes` if true |

## List Functions

| Function | Usage | Description | Example |
|----------|-------|-------------|---------|
| `list` | `{{ list 1 2 3 }}` | Create list | `[1, 2, 3]` |
| `append` | `{{ append .list 4 }}` | Append to list | `[1, 2, 3, 4]` |
| `prepend` | `{{ prepend .list 0 }}` | Prepend to list | `[0, 1, 2, 3]` |
| `first` | `{{ first .list }}` | First element | `1` |
| `last` | `{{ last .list }}` | Last element | `3` |
| `rest` | `{{ rest .list }}` | All but first | `[2, 3]` |
| `initial` | `{{ initial .list }}` | All but last | `[1, 2]` |
| `reverse` | `{{ reverse .list }}` | Reverse list | `[3, 2, 1]` |
| `uniq` | `{{ list 1 2 2 3 \| uniq }}` | Remove duplicates | `[1, 2, 3]` |
| `sortAlpha` | `{{ list "c" "a" "b" \| sortAlpha }}` | Sort alphabetically | `[a, b, c]` |
| `concat` | `{{ concat .list1 .list2 }}` | Concatenate lists | Combined list |
| `slice` | `{{ slice .list 1 3 }}` | Slice list | Elements 1-3 |
| `has` | `{{ has 2 .list }}` | Check if contains | `true/false` |
| `without` | `{{ without .list 2 }}` | Remove element | `[1, 3]` |
| `compact` | `{{ list 1 "" 2 \| compact }}` | Remove empty values | `[1, 2]` |

## Dict (Map) Functions

| Function | Usage | Description | Example |
|----------|-------|-------------|---------|
| `dict` | `{{ dict "key" "value" }}` | Create dict | `{key: value}` |
| `get` | `{{ get .dict "key" }}` | Get value by key | Value |
| `set` | `{{ $_ := set .dict "k" "v" }}` | Set key-value | Modified dict |
| `unset` | `{{ $_ := unset .dict "key" }}` | Remove key | Modified dict |
| `hasKey` | `{{ hasKey .dict "key" }}` | Check if key exists | `true/false` |
| `pluck` | `{{ pluck "name" .list }}` | Extract field from list | `[name1, name2]` |
| `keys` | `{{ keys .dict }}` | Get all keys | `[key1, key2]` |
| `values` | `{{ values .dict }}` | Get all values | `[val1, val2]` |
| `pick` | `{{ pick .dict "k1" "k2" }}` | Pick specific keys | Subset dict |
| `omit` | `{{ omit .dict "k1" "k2" }}` | Omit specific keys | Subset dict |
| `merge` | `{{ merge .dict1 .dict2 }}` | Merge dicts | Combined dict |
| `mergeOverwrite` | `{{ mergeOverwrite .d1 .d2 }}` | Merge with overwrite | Combined dict |
| `deepCopy` | `{{ deepCopy .dict }}` | Deep copy dict | Cloned dict |

## Math Functions

| Function | Usage | Description | Example |
|----------|-------|-------------|---------|
| `add` | `{{ add 1 2 }}` | Addition | `3` |
| `add1` | `{{ add1 5 }}` | Add 1 | `6` |
| `sub` | `{{ sub 5 3 }}` | Subtraction | `2` |
| `div` | `{{ div 10 2 }}` | Division | `5` |
| `mod` | `{{ mod 10 3 }}` | Modulo | `1` |
| `mul` | `{{ mul 3 4 }}` | Multiplication | `12` |
| `max` | `{{ max 1 5 3 }}` | Maximum value | `5` |
| `min` | `{{ min 1 5 3 }}` | Minimum value | `1` |
| `floor` | `{{ floor 1.7 }}` | Round down | `1` |
| `ceil` | `{{ ceil 1.3 }}` | Round up | `2` |
| `round` | `{{ round 1.5 2 }}` | Round to N decimals | `1.50` |

## Logic Functions

| Function | Usage | Description | Example |
|----------|-------|-------------|---------|
| `eq` | `{{ eq .a .b }}` | Equal | `true/false` |
| `ne` | `{{ ne .a .b }}` | Not equal | `true/false` |
| `lt` | `{{ lt .a .b }}` | Less than | `true/false` |
| `le` | `{{ le .a .b }}` | Less or equal | `true/false` |
| `gt` | `{{ gt .a .b }}` | Greater than | `true/false` |
| `ge` | `{{ ge .a .b }}` | Greater or equal | `true/false` |
| `and` | `{{ and .a .b }}` | Logical AND | `true/false` |
| `or` | `{{ or .a .b }}` | Logical OR | `true/false` |
| `not` | `{{ not .value }}` | Logical NOT | `true/false` |

## Flow Control

### if/else

```yaml
{{- if .Values.enabled }}
enabled: true
{{- else if .Values.disabled }}
enabled: false
{{- else }}
enabled: default
{{- end }}
```

### with

```yaml
# Changes scope to .Values.server
{{- with .Values.server }}
host: {{ .host }}
port: {{ .port }}
{{- end }}
```

### range (loop)

```yaml
# Loop over list
{{- range .Values.items }}
- {{ . }}
{{- end }}

# Loop with index
{{- range $index, $value := .Values.items }}
- [{{ $index }}]: {{ $value }}
{{- end }}

# Loop over dict
{{- range $key, $value := .Values.config }}
{{ $key }}: {{ $value }}
{{- end }}
```

## Special Functions

| Function | Usage | Description |
|----------|-------|-------------|
| `include` | `{{ include "template" . }}` | Include named template |
| `required` | `{{ required "msg" .value }}` | Require value (fail if empty) |
| `fail` | `{{ fail "error message" }}` | Fail with message |
| `lookup` | `{{ lookup "v1" "Pod" "ns" "name" }}` | Look up K8s resource |
| `toDate` | `{{ now \| toDate "2006-01-02" }}` | Format date |
| `now` | `{{ now }}` | Current time |
| `date` | `{{ now \| date "2006-01-02" }}` | Format date |
| `dateInZone` | `{{ now \| dateInZone "..." "UTC" }}` | Date in timezone |
| `duration` | `{{ duration "1h30m" }}` | Parse duration |
| `durationRound` | `{{ now \| durationRound "1h" }}` | Round duration |
| `uuidv4` | `{{ uuidv4 }}` | Generate UUID |
| `sha256sum` | `{{ "text" \| sha256sum }}` | SHA-256 hash |
| `sha1sum` | `{{ "text" \| sha1sum }}` | SHA-1 hash |
| `adler32sum` | `{{ "text" \| adler32sum }}` | Adler-32 checksum |
| `b64enc` | `{{ "text" \| b64enc }}` | Base64 encode |
| `b64dec` | `{{ "dGV4dA==" \| b64dec }}` | Base64 decode |
| `b32enc` | `{{ "text" \| b32enc }}` | Base32 encode |
| `b32dec` | `{{ .value \| b32dec }}` | Base32 decode |

## Regex Functions

| Function | Usage | Description |
|----------|-------|-------------|
| `regexMatch` | `{{ regexMatch "^[a-z]+$" .value }}` | Test regex match |
| `regexFindAll` | `{{ regexFindAll "[0-9]+" .value -1 }}` | Find all matches |
| `regexFind` | `{{ regexFind "[0-9]+" .value }}` | Find first match |
| `regexReplaceAll` | `{{ regexReplaceAll "a" .value "b" }}` | Replace all matches |
| `regexReplaceAllLiteral` | `{{ regexReplaceAllLiteral "a" .value "b" }}` | Replace (literal) |
| `regexSplit` | `{{ regexSplit "," .value -1 }}` | Split by regex |

## Whitespace Control

```yaml
# Remove whitespace before
{{- .value }}

# Remove whitespace after
{{ .value -}}

# Remove both
{{- .value -}}

# Example
{{- if .condition -}}
  value
{{- end -}}
```

## Pipeline Examples

```yaml
# Multiple functions
{{ .Values.name | upper | quote }}

# With default
{{ .Values.name | default "myapp" | trunc 63 | trimSuffix "-" }}

# Complex pipeline
{{ .Values.image.repository | default "nginx" }}:{{ .Values.image.tag | default .Chart.AppVersion }}

# toYaml with indent
resources:
  {{- toYaml .Values.resources | nindent 2 }}

# Include template with pipeline
labels:
  {{- include "mychart.labels" . | nindent 4 }}
```

## Common Patterns

### Safe Name Generation

```yaml
{{- define "mychart.fullname" -}}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
```

### Conditional Resource

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
# ...
{{- end }}
```

### Loop with Separator

```yaml
hosts:
{{- range .Values.hosts }}
  - {{ . | quote }}
{{- end }}
```

### Merge Labels

```yaml
labels:
  {{- include "mychart.labels" . | nindent 4 }}
  {{- with .Values.additionalLabels }}
  {{- toYaml . | nindent 4 }}
  {{- end }}
```

## Tags

`helm`, `templates`, `functions`, `cheatsheet`, `kubernetes`

---

*Last updated: 2025-10-30*
