# Danh sách phần thưởng — Túi Mù Tri Thức
# Tổng: 27 hiệu ứng, đánh số 1–27

---

## Hiệu ứng tích cực (điểm dương)

**Phần thưởng 1**: +1 điểm
- type: simple, value: +1

**Phần thưởng 2**: +3 điểm
- type: simple, value: +3

**Phần thưởng 3**: +5 điểm
- type: simple, value: +5

**Phần thưởng 20**: +2 điểm (bản sao có chủ ý)
- type: simple, value: +2

**Phần thưởng 21**: +2 điểm (bản sao có chủ ý)
- type: simple, value: +2

**Phần thưởng 6**: Nhân đôi số điểm hiện có (×2)
- type: double_self

**Phần thưởng 19**: Gấp đôi phần thưởng của lượt tiếp theo
- type: double_next

**Phần thưởng 17**: Hồi sinh — nếu đang âm điểm, quay về 0 điểm
- type: revive

---

## Hiệu ứng tiêu cực (điểm âm)

**Phần thưởng 8**: -3 điểm
- type: simple, value: -3

**Phần thưởng 9**: -4 điểm
- type: simple, value: -4

**Phần thưởng 10**: -5 điểm
- type: simple, value: -5

**Phần thưởng 22**: -3 điểm (bản sao có chủ ý)
- type: simple, value: -3

**Phần thưởng 23**: -1 điểm
- type: simple, value: -1

**Phần thưởng 7**: Chia đôi số điểm hiện có (÷2)
- type: halve_self

---

## Hiệu ứng tương tác (cần chọn nhóm mục tiêu)

**Phần thưởng 4**: Chọn 1 nhóm chơi tù xì — thắng được +3 điểm
- type: host_manage, needsTarget: true
- Ghi chú: host xử lý thủ công kết quả tù xì; thắng → dùng nút Chỉnh điểm +3

**Phần thưởng 11**: Đổi điểm với một nhóm khác
- type: swap, needsTarget: true

**Phần thưởng 12**: Cướp 3 điểm từ một nhóm khác
- type: steal3, needsTarget: true

**Phần thưởng 13**: Tặng một nhóm khác 3 điểm (nhóm tặng được cộng 1 điểm)
- type: give3get1, needsTarget: true

**Phần thưởng 14**: Ném bom một nhóm khác về 0 điểm (nhóm sử dụng bị trừ 3 điểm)
- type: bomb, needsTarget: true

**Phần thưởng 15**: Chọn một nhóm bất kỳ bị -2 điểm
- type: minus2other, needsTarget: true

**Phần thưởng 24**: Chuyển 3 điểm của mình sang nhóm khác, nhận lại +5 điểm
- type: give3get5, needsTarget: true
- Hiệu ứng: act.score -= 3; tgt.score += 3; act.score += 5 → net: act +2, tgt +3

---

## Hiệu ứng toàn bộ nhóm

**Phần thưởng 5**: Cả lớp đều -1 điểm, riêng nhóm bạn +2 điểm
- type: all_minus1_self_plus2
- Hiệu ứng: mọi nhóm -1 điểm, nhóm bốc được +2 điểm (net: bốc +1, còn lại -1)

---

## Hiệu ứng bảo vệ & đặc biệt

**Phần thưởng 16**: Bảo vệ bản thân — miễn mọi hiệu ứng xấu trong 1 lượt
- type: shield

**Phần thưởng 18**: Cướp quyền trả lời của lượt tiếp theo
- type: steal_turn

**Phần thưởng 26**: Sử dụng lại 1 phần thưởng mà các nhóm trước đã bốc được
- type: reuse_prev

**Phần thưởng 27**: Đảo ngược hiệu ứng — biến điểm âm thành dương hoặc ngược lại
- type: reverse
- Cách áp dụng: act.score = -act.score (đảo dấu điểm hiện tại của nhóm)

---

## Hiệu ứng trung lập

**Phần thưởng 25**: Không có phần thưởng nào cả
- type: nothing
