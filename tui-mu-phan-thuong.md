# Danh sách phần thưởng - Túi Mù Tri Thức
# Tổng: 15 hiệu ứng, đánh số 1-15

---

## Hiệu ứng điểm trực tiếp

**Phần thưởng 1**: +1 điểm
- type: simple, value: +1

**Phần thưởng 2**: +3 điểm
- type: simple, value: +3

**Phần thưởng 3**: +5 điểm
- type: simple, value: +5

**Phần thưởng 8**: -2 điểm
- type: simple, value: -2

**Phần thưởng 9**: -3 điểm
- type: simple, value: -3

**Phần thưởng 10**: -5 điểm
- type: simple, value: -5

---

## Hiệu ứng thay đổi điểm hiện có

**Phần thưởng 6**: Nhân đôi số điểm hiện có (x2)
- type: double_self

**Phần thưởng 7**: Chia đôi số điểm hiện có (/2)
- type: halve_self

---

## Hiệu ứng tương tác

**Phần thưởng 4**: Chọn 1 nhóm chơi tù xì - thắng +3 điểm
- type: host_manage, needsTarget: true
- Ghi chú: host xử lý thủ công kết quả tù xì; thắng -> dùng nút Chỉnh điểm +3.

**Phần thưởng 11**: Đổi điểm với một nhóm khác
- type: swap, needsTarget: true

**Phần thưởng 12**: Cướp 3 điểm từ một nhóm khác
- type: steal3, needsTarget: true

**Phần thưởng 13**: Tặng một nhóm khác 3 điểm (nhóm tặng được cộng 1 điểm)
- type: give3get1, needsTarget: true

**Phần thưởng 14**: Chọn một nhóm bất kỳ bị -2 điểm
- type: minus2other, needsTarget: true

---

## Hiệu ứng toàn lớp

**Phần thưởng 5**: Cả lớp đều -1 điểm, riêng nhóm bạn +2 điểm
- type: all_minus1_self_plus2
- Hiệu ứng: mọi nhóm -1 điểm, nhóm bốc được +2 điểm.

---

## Hiệu ứng bảo vệ

**Phần thưởng 15**: Bảo vệ bản thân - miễn mọi hiệu ứng xấu trong 1 lượt
- type: shield
