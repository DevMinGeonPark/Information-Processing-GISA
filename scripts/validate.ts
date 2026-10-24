// 사용법: node scripts/validate.ts [data-root] [--baseline <taxonomy.json>]
// data-root 는 data/ 를 담은 디렉터리 또는 data/ 자체 (기본: 현재 디렉터리).
import { validateDataRoot, formatIssue } from "./validate-lib.ts";

const args = process.argv.slice(2);
const bi = args.indexOf("--baseline");
const baselinePath = bi >= 0 ? args[bi + 1] : undefined;
const root = args.find((a, i) => !a.startsWith("--") && (bi < 0 || i !== bi + 1)) ?? process.cwd();

const { errors, warnings, notices } = validateDataRoot(root, { baselinePath });
for (const e of errors) console.log(`ERROR ${formatIssue(e)}`);
for (const w of warnings) console.log(`WARN  ${formatIssue(w)}`);
for (const n of notices) console.log(`NOTE  ${n}`);
console.log(`${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length > 0 ? 1 : 0);
