# Omnia Harness — Danh mục tính năng (v1 brainstorm, 2026-10-30)

Nguyên tắc gốc: **người dùng là luật**. Harness không tự cấm, không tự lọc nội dung,
không có danh sách "chủ đề bị chặn". Mọi giới hạn là cấu hình của chính người dùng,
xem được, sửa được, tắt được. Harness chỉ hỏi khi người dùng *chọn* muốn được hỏi.

Giới hạn duy nhất nằm ngoài harness: model của nhà cung cấp có thể tự từ chối theo
chính sách của họ. Omnia không lách việc đó bằng jailbreak/giả dạng client; thay vào đó
cho người dùng đổi model (kể cả model local) ngay trong cùng phiên, một phím.

Ký hiệu mốc: M1 lõi harness · M2 UI · M3 browser · M4 computer · M5 hoàn thiện · L sau 1.0

---

## 1. Lõi agent (M1)
- Vòng lặp agent Rust, luồng sự kiện append-only ghi vào run journal (replay, resume sau crash).
- Gọi tool song song khi các tool độc lập; tuần tự khi có phụ thuộc.
- Streaming token + streaming kết quả tool (lệnh dài hiển thị output trực tiếp).
- Ngắt giữa chừng (Esc) → giữ trạng thái, có thể "tiếp tục" hoặc "sửa hướng" (steer) mà không mất ngữ cảnh.
- Hàng đợi tin nhắn: gõ tiếp khi agent đang chạy, tin được chèn ở điểm an toàn kế tiếp.
- Rẽ nhánh hội thoại (fork) từ bất kỳ lượt nào; so sánh 2 nhánh cạnh nhau.
- Checkpoint file theo từng lượt: tua lại code + hội thoại về lượt bất kỳ (rewind).
- Chế độ: Chat · Plan (chỉ đọc, ra kế hoạch để duyệt) · Build · Auto (chạy liền mạch).
- Effort/thinking chỉnh theo phiên và theo từng tin.

## 2. Model & provider (M1)
- Provider trung lập: Anthropic Messages, OpenAI Responses/Chat, Gemini, OpenAI-compatible, Ollama/LM Studio/llama.cpp local, htmustc-proxy.
- Đổi model giữa phiên, giữ nguyên lịch sử (chuyển đổi định dạng tool-call tự động).
- Model theo vai trò: điều phối (mạnh), worker (rẻ), tóm tắt/nén (rất rẻ), vision, embedding.
- Fallback do người dùng cấu hình (không tự ý đổi provider ngầm), hiển thị rõ khi fallback.
- Prompt caching tự động theo provider, hiển thị cache hit.
- Đếm token, chi phí theo lượt/phiên/dự án, ngân sách và cảnh báo (người dùng đặt).
- System prompt hoàn toàn chỉnh được: xem, sửa, lưu preset, theo dự án.

## 3. Quyền & chính sách — người dùng là luật (M1)
- 4 chế độ quyền: Hỏi mọi thứ · Hỏi khi ghi/chạy · Tự động (chỉ hỏi việc khó đảo ngược) · Toàn quyền (không hỏi gì).
- Luật allow/deny theo tool, lệnh, đường dẫn, domain — glob/regex, theo dự án hoặc toàn cục.
- "Luôn cho phép" ngay trên thẻ duyệt → tự sinh luật, xem/sửa trong một danh sách.
- Hàng chờ duyệt có thứ tự (2/5), duyệt hàng loạt, duyệt kèm sửa tham số.
- Không có bộ lọc nội dung ở tầng harness. Không có chủ đề cấm cứng.
- Nhật ký mọi hành động (audit) để người dùng tự kiểm tra lại, có hoàn tác khi có thể.
- Sandbox tuỳ chọn (không bắt buộc): chạy lệnh trong thư mục/worktree cách ly, giới hạn mạng.

## 4. Tool có sẵn (M1)
- File: đọc (ảnh, PDF, notebook), ghi, sửa chính xác, sửa nhiều file, patch, glob, grep (ripgrep nhúng).
- Shell: PowerShell, Git Bash, WSL, cmd; chạy nền, theo dõi output, dừng, phiên shell bền.
- Web: tìm kiếm (nhiều engine), fetch trang → markdown, tải file.
- Git: status/diff/commit/branch/worktree/PR (gh), giải xung đột có hỗ trợ.
- LSP: định nghĩa, tham chiếu, chẩn đoán lỗi, đổi tên an toàn — cho mọi ngôn ngữ có LSP.
- Notebook, SQLite/Postgres client, HTTP client, đọc Office/PDF.
- Reverse engineering: tích hợp REA làm MCP có sẵn (dùng cho phần mềm người dùng được phép phân tích).

## 5. Subagent & đa agent (M1)
- Subagent định nghĩa bằng file (tên, model, tool, prompt), chạy nền song song.
- Điều phối: agent chính chia việc → worker rẻ code → agent mạnh review/nghiệm thu.
- Mỗi subagent một worktree riêng; gộp kết quả có xem diff.
- Hộp thư giữa các agent, agent hỏi lại agent chính khi bị chặn.
- Bảng theo dõi các agent đang chạy: trạng thái, token, chi phí, dừng/nhắn tin.
- Phiên nền dài hạn, tiếp tục chạy khi đóng cửa sổ; thông báo khi xong.

## 6. Ngữ cảnh & bộ nhớ (M1)
- Context compiler: tự nén khi gần đầy, giữ quyết định quan trọng; người dùng xem được bản nén.
- File quy tắc dự án (OMNIA.md, đọc cả CLAUDE.md/AGENTS.md), theo cây thư mục.
- Bộ nhớ dài hạn theo người dùng/dự án, dạng file, sửa tay được, có liên kết [[...]].
- Chỉ mục mã nguồn ngữ nghĩa (embedding local) + tìm theo ký hiệu.
- @mention file, thư mục, URL, phiên khác, kết quả tool cũ.
- Thanh ngữ cảnh: còn bao nhiêu token, cái gì đang chiếm chỗ, gỡ từng mục.

## 7. Mở rộng (M1)
- MCP client đầy đủ (stdio, HTTP, SSE), OAuth cho MCP, bật/tắt theo phiên.
- Skills: thư mục SKILL.md + script, tự gợi ý skill theo tác vụ, chợ skill.
- Hook trước/sau tool, khi bắt đầu/kết thúc lượt, khi thông báo — script bất kỳ.
- Slash command tự định nghĩa; plugin = gói (skills + hook + command + MCP + agent).
- Omnia tự làm MCP server: app khác điều khiển Omnia được.

## 8. Browser use nâng cao (M3)
- Pane trình duyệt nhúng (WebView2/CDP) + điều khiển Chrome thật của người dùng (tuỳ chọn).
- Cây accessibility có ref → click/gõ theo ref (ổn định hơn toạ độ), fallback toạ độ + ảnh.
- Batch thao tác: nhiều bước một lượt gọi.
- Nhiều tab, console, network, chạy JS, giả lập mobile/dark mode, upload file.
- Xem trước dev server của dự án, tự mở khi chạy `npm run dev`.
- Ghi lại phiên thao tác thành GIF/video; ghi lại thành script Playwright tái chạy.
- Đăng nhập được giữ trong hồ sơ trình duyệt riêng của Omnia.

## 8b. Trình tải xuống (M3)
- Bắt mọi request qua CDP (Network domain) của pane trình duyệt: liệt kê media, tài liệu, XHR theo tab, lọc theo loại/kích thước.
- Nhận diện tự động: video/audio trực tiếp, HLS (m3u8, master → chọn chất lượng), DASH (mpd), PDF, ảnh, file đính kèm, blob: URL (đọc lại từ trang hoặc bắt từ MediaSource/fetch gốc).
- Ghép lại stream: tải segment song song, giải mã AES-128 chuẩn HLS (khóa do chính playlist cung cấp), ghép audio+video, xuất MP4/MKV bằng ffmpeg nhúng.
- Bộ tải đa luồng: chia đoạn theo Range, tạm dừng/tiếp tục, tự thử lại, giới hạn tốc độ, hàng đợi, lập lịch, tải theo lô.
- Giữ cookie/header/referer của phiên duyệt để tải được file cần đăng nhập (tài khoản của chính người dùng).
- Lưu PDF từ trình xem PDF nhúng, "in trang thành PDF", lưu trang đầy đủ (HTML + tài nguyên).
- Bắt link từ clipboard, kéo-thả link, tích hợp với agent: "tải hết video trong trang này".
- Hàng chờ tải là một tab trong pane phải: danh sách tối giản, gom theo trang nguồn.
- Không làm: gỡ DRM (Widevine/PlayReady/FairPlay) hay vượt paywall — stream có DRM được đánh dấu "được bảo vệ" và bỏ qua.

## 9. Computer use nâng cao (M4)
- Ưu tiên ngữ nghĩa: Windows UI Automation (cây control, tên, vai trò) → hành động không cần nhìn.
- Fallback vision: ảnh màn hình + toạ độ, zoom vùng, đa màn hình, DPI-aware.
- Chuột/phím/clipboard/cửa sổ (focus, di chuyển, kích thước), mở app, đọc text OCR.
- Phân quyền theo app (người dùng đặt: xem / thao tác / toàn quyền).
- Chế độ chạy nền: điều khiển trên desktop ảo để không chiếm chuột người dùng.
- Phím khẩn cấp dừng toàn bộ.

## 10. UI — tối giản, danh sách, gom nhóm (M2)
- Bố cục 3 vùng: danh sách phiên trái · hội thoại giữa · pane phải (Diff, Terminal, Browser, Tasks, Files, Agents).
- Danh sách phiên: gom theo Dự án → ngày; ghim; đánh dấu chưa đọc; tìm kiếm toàn văn.
- Task list gắn dưới tin nhắn cuối; hộp "bước tiếp theo" với nút trả lời nhanh.
- Thẻ tool thu gọn mặc định, mở ra xem chi tiết; diff inline có duyệt từng hunk.
- Command palette (Ctrl+K) cho mọi hành động; phím tắt tuỳ chỉnh.
- Split view nhiều phiên; terminal tích hợp.
- Light/dark/high-contrast, 1 bộ token, không dashboard trang trí.
- Toàn bộ màn "studio/workbench/lab" cũ chuyển vào mục Labs hoặc xoá.

## 11. Tự động hoá & tích hợp (L)
- Tác vụ định kỳ (cron) và vòng lặp tự điều nhịp.
- Theo dõi CI/PR, tự sửa CI, trả lời review comment.
- Điều khiển từ xa: điện thoại/web vào phiên trên máy.
- Kết nối Gmail/Calendar/Drive/Slack/Notion qua MCP.
- Thông báo Windows, toast, khay hệ thống.

## 12. Tạo nội dung (L)
- Artifact: trang HTML/ứng dụng nhỏ xem ngay trong pane, chia sẻ được.
- Xuất DOCX/PPTX/XLSX/PDF; sơ đồ, biểu đồ.
- Giọng nói: nói để ra lệnh, đọc câu trả lời.

## 13. Vận hành (M5)
- Telemetry local (không gửi đi), trình xem request/response thô.
- Xuất/nhập toàn bộ dữ liệu, sao lưu, đồng bộ giữa máy.
- Tự cập nhật, cài đặt EXE/MSIX, khởi động nhanh, bundle dưới ngân sách.
- Bộ eval: kịch bản chuẩn để đo harness sau mỗi thay đổi.
