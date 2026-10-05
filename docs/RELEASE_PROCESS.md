# Release process — changing a checklist

Every change is reviewed and traceable. `main` is protected: changes go through a pull request.

## 1. Decide the change
* Content correction (limit, wording, frequency) → **patch** (1.1.0 → 1.1.1), revision +1 on the checklist.
* New checklist → **minor** (1.1.0 → 1.2.0), new document number (next free number in the discipline, never reuse).
* Numbering, layout or structure → **major**.

## 2. Edit
1. Open the checklist file in `checklists/` on GitHub and click the **pencil** (edit).
2. Change the content. Keep the `id` of existing check points — drafts and reports depend on them. Add new points at the end of their section.
3. `data/document-register.js` — raise the revision of the checklist (`"0"` → `"1"`); for a new checklist add `"<id>": ["CMI-XXX-nnn", "0"],`.
4. `assets/js/app.js` — update `APP_VERSION` and `APP_RELEASE`.
5. `index.html` — update every `?v=` to the new version (forces phones to load the new files).
6. `CHANGELOG.md` — add what changed and who approved it.
7. `docs/CHECKLIST_REGISTER.md` — update the revision.

## 3. Propose and merge
1. Choose **Create a new branch and start a pull request**.
2. Fill in the template (what, why, approved by, checklists affected).
3. Check the preview, then **Merge pull request**.
4. Wait for the green tick on *github-pages* (1–2 min) and test the changed checklist and its PDF.

## 4. Inform
Tell supervisors which checklists changed (number, old rev → new rev). Paper copies are uncontrolled.
