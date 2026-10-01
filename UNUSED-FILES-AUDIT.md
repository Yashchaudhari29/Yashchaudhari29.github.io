# Unused-file and duplicate audit

**Cleanup completed:** Removed the six legacy CSS/JS files, three optional migration scripts and link-audit JSON. Removed the stale contact-video manifest entry. The eight files in `assets/field-notes/` are explicitly preserved at the owner's request. Tables below record the pre-cleanup snapshot, not the current remaining files.

Snapshot of the current working tree. No files deleted by this audit. Sizes are logical bytes, not OneDrive disk allocation. Git history and node_modules excluded from site totals.

Traced HTML/CSS references, JS imports and workers, generated frame URLs, media manifests and build inputs. Absence from index.html alone was not treated as proof of being unused.

## Unused legacy images

2 files; 107,186 bytes (0.107 MB).

| File | Bytes |
| --- | ---: |
| `assets/location-sign-svgrepo-com.svg` | 916 |
| `assets/wave-hello.gif` | 106,270 |

## Old notebook artwork

8 files; 45,296 bytes (0.045 MB).

| File | Bytes |
| --- | ---: |
| `assets/field-notes/accuracy.svg` | 10,636 |
| `assets/field-notes/attention.svg` | 5,962 |
| `assets/field-notes/browser.svg` | 3,395 |
| `assets/field-notes/diffusion.svg` | 13,546 |
| `assets/field-notes/embeddings.svg` | 2,967 |
| `assets/field-notes/experts.svg` | 3,070 |
| `assets/field-notes/lora.svg` | 2,736 |
| `assets/field-notes/retrieval.svg` | 2,984 |

## Old CSS and JS

6 files; 26,911 bytes (0.027 MB).

| File | Bytes |
| --- | ---: |
| `css/preloader.css` | 1,611 |
| `css/style.css` | 13,762 |
| `css/style1.css` | 4,344 |
| `script/download.js` | 1,472 |
| `script/preloader.js` | 2,902 |
| `script/typed.js` | 2,820 |

## Old download directory

2 files; 8,306,444 bytes (8.306 MB).

| File | Bytes |
| --- | ---: |
| `certi&lor/ONGC_CERTIFICATE.jpg` | 4,425,975 |
| `certi&lor/ONGC_LOR.jpg` | 3,880,469 |

## Stale contact media

3 files; 3,603,428 bytes (3.603 MB).

| File | Bytes |
| --- | ---: |
| `media/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa_low.mp4` | 791,251 |
| `media/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa_mid.mp4` | 2,549,985 |
| `media/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa_poster.webp` | 262,192 |

## Optional migration scripts

3 files; 14,207 bytes (0.014 MB).

| File | Bytes |
| --- | ---: |
| `inject.py` | 6,319 |
| `inject_projects.py` | 3,668 |
| `script.py` | 4,220 |

## Optional audit output

1 files; 4,278 bytes (0.004 MB).

| File | Bytes |
| --- | ---: |
| `tools/link-audit-results.json` | 4,278 |

## Findings and deletion conditions

- **21 currently present files are unused by the website, totaling 12,089,265 bytes (12.089 MB).**
- Additional optional historical tooling/output: 4 files, 18,485 bytes.
- Old CSS/JS files are not loaded by the page or active module graph. typed.js in package.json is the library package, not script/typed.js.
- The old SVG notebook is replaced by assets/sketchbook. Full/small WebP variants are both active and must stay.
- Current downloads target assets/ONGC_CERTIFICATE.JPG and assets/ONGC_LOR.JPG. Only the unused script/download.js points at certi&lor.
- The certificate copies are byte-identical. The two LOR images are different binaries; the unused one may have archival value.
- Three former contact video files have an obsolete entry in media/manifest.json. Delete that entry together with the files if cleaning up; the current page never selects that video source.
- Root Python scripts are one-off HTML migrations, not current npm build steps. Keep only if useful as historical source.
- The audit JSON is not runtime data. Removing it loses detailed link-check evidence and makes its documentation reference stale.
- Eight old images disappeared during this read-only scan: attendece_system.jpg, digit_recog.jpg, hand_recog.jpg, img2.png, spam_detect.jpeg, y1.jpg, y2.webp, y3.png. Git reports their deletions. They are excluded from the current total.

## SHA-256 duplicate groups

24 exact pairs. Only the unused certificate copy is directly removable; active frame copies need a loader/manifest change.

| Copy A | Copy B | Bytes per copy |
| --- | --- | ---: |
| `assets/ONGC_CERTIFICATE.JPG` | `certi&lor/ONGC_CERTIFICATE.jpg` | 4,425,975 |
| `frames/desktop/frame_000.webp` | `frames/mobile/frame_000.webp` | 103,064 |
| `frames/desktop/frame_025.webp` | `frames/mobile/frame_004.webp` | 155,212 |
| `frames/desktop/frame_031.webp` | `frames/mobile/frame_005.webp` | 145,290 |
| `frames/desktop/frame_037.webp` | `frames/mobile/frame_006.webp` | 118,064 |
| `frames/desktop/frame_043.webp` | `frames/mobile/frame_007.webp` | 134,120 |
| `frames/desktop/frame_050.webp` | `frames/mobile/frame_008.webp` | 159,894 |
| `frames/desktop/frame_056.webp` | `frames/mobile/frame_009.webp` | 178,080 |
| `frames/desktop/frame_062.webp` | `frames/mobile/frame_010.webp` | 170,466 |
| `frames/desktop/frame_068.webp` | `frames/mobile/frame_011.webp` | 175,288 |
| `frames/desktop/frame_075.webp` | `frames/mobile/frame_012.webp` | 153,350 |
| `frames/desktop/frame_081.webp` | `frames/mobile/frame_013.webp` | 149,040 |
| `frames/desktop/frame_087.webp` | `frames/mobile/frame_014.webp` | 162,890 |
| `frames/desktop/frame_118.webp` | `frames/mobile/frame_019.webp` | 192,452 |
| `frames/desktop/frame_124.webp` | `frames/mobile/frame_020.webp` | 187,190 |
| `frames/desktop/frame_130.webp` | `frames/mobile/frame_021.webp` | 213,968 |
| `frames/desktop/frame_136.webp` | `frames/mobile/frame_022.webp` | 227,528 |
| `frames/desktop/frame_143.webp` | `frames/mobile/frame_023.webp` | 233,510 |
| `frames/desktop/frame_149.webp` | `frames/mobile/frame_024.webp` | 213,366 |
| `frames/desktop/frame_155.webp` | `frames/mobile/frame_025.webp` | 203,842 |
| `frames/desktop/frame_161.webp` | `frames/mobile/frame_026.webp` | 216,070 |
| `frames/desktop/frame_168.webp` | `frames/mobile/frame_027.webp` | 233,252 |
| `frames/desktop/frame_174.webp` | `frames/mobile/frame_028.webp` | 238,044 |
| `frames/desktop/frame_180.webp` | `frames/mobile/frame_029.webp` | 239,680 |

Active frame duplication: 4,203,660 bytes (4.204 MB), not included in unused totals. Both frame sequences generate numbered runtime URLs. Deleting shared-looking frames without changing those URLs breaks animation.

## Keep / not waste

- All 211 numbered hero frames plus their manifest: active desktop/mobile sequences.
- The remaining 15 local video renditions/posters and media manifest: adaptive playback.
- All 16 sketchbook WebP images: responsive variants.
- Tests, build tools, preview server, media/Tailwind configuration, package manifests, robots and sitemap.
- Project and vendored LICENSE files: required legal notices.
- node_modules: reinstallable development dependencies, already ignored/excluded from deployment; do not classify installed package internals as unused website assets.
- Documentation, artwork prompts and editor settings: optional maintenance material rather than confirmed redundant files.

## Separate optimization

assets/y4.png is a used favicon of 2.09 MB. It is oversized for that role, but is not unused. Optimizing it would affect transfer size; removing unreferenced files generally only saves repository/deployment storage. Deleting tracked files does not immediately shrink Git history.
