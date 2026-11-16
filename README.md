# Quality Inspection DApp

Ứng dụng phi tập trung (Decentralized Application - DApp) hỗ trợ quản lý và theo dõi kết quả kiểm định chất lượng sản phẩm bằng công nghệ blockchain Ethereum.

Hệ thống cho phép người quản lý đăng ký sản phẩm, nhân viên kiểm định ghi nhận kết quả và người dùng công khai tra cứu thông tin kiểm định mà không cần kết nối ví.

## 1. Công nghệ sử dụng

| Thành phần         | Công nghệ                    |
| ------------------ | ---------------------------- |
| Frontend           | React, Vite, JavaScript, CSS |
| Smart Contract     | Solidity ^0.8.20             |
| Blockchain         | Ethereum Sepolia Testnet     |
| Web3 Library       | ethers.js                    |
| Ví điện tử         | MetaMask                     |
| Công cụ phát triển | VS Code, Remix IDE           |

## 2. Chức năng chính

### Manager (Người quản lý)

- Đăng ký sản phẩm bằng Item ID duy nhất.
- Giới hạn tối đa 50 sản phẩm.
- Sản phẩm mới được đăng ký có trạng thái `Pending`.
- Chỉ ví Manager được phép thực hiện chức năng đăng ký.

### Inspector (Nhân viên kiểm định)

- Kiểm định các sản phẩm đã được đăng ký.
- Ghi nhận kết quả `Passed` hoặc `Failed`.
- Mỗi sản phẩm chỉ được kiểm định một lần.
- Chỉ ví Inspector được phép ghi nhận kết quả.

### Viewer (Người xem)

- Xem danh sách sản phẩm và trạng thái kiểm định.
- Xem thống kê `Total`, `Passed`, `Failed`, `Pending`.
- Không cần kết nối MetaMask để xem dữ liệu.
- Không có quyền đăng ký hoặc kiểm định sản phẩm.

## 3. Cấu trúc thư mục

```text
quality-inspection-dapp/
├── contracts/
│   └── QualityInspection.sol
├── src/
│   ├── contracts/
│   │   └── QualityInspectionABI.json
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── public/
├── package.json
├── vite.config.js
└── README.md
```

Trong đó:

- `contracts/QualityInspection.sol`: Mã nguồn Smart Contract Solidity.
- `src/contracts/QualityInspectionABI.json`: ABI dùng để giao tiếp với Smart Contract.
- `src/App.jsx`: Logic chính của ứng dụng React.
- `src/App.css`: Định dạng giao diện.
- `package.json`: Khai báo dependencies và các lệnh chạy project.

## 4. Hướng dẫn cài đặt và chạy ứng dụng

### 4.1. Yêu cầu trước khi cài đặt

Máy tính cần có:

- Node.js và npm
- Git
- Trình duyệt Chrome hoặc trình duyệt tương thích
- MetaMask Extension (nếu muốn thực hiện giao dịch)

Có thể kiểm tra Node.js và npm bằng:

```bash
node -v
npm -v
```

### 4.2. Clone repository

Mở Terminal hoặc PowerShell và chạy:

```bash
git clone https://github.com/manhh05/quality-inspection-dapp.git
cd quality-inspection-dapp
```

Thay `YOUR_USERNAME` bằng tên tài khoản GitHub chứa repository.

### 4.3. Cài đặt dependencies

Tại thư mục gốc của project, chạy:

```bash
npm install
```

Lệnh này sẽ tự động cài đặt các thư viện được khai báo trong `package.json`.

### 4.4. Khởi chạy ứng dụng

Chạy lệnh:

```bash
npm run dev
```

Sau khi khởi động thành công, Vite sẽ cung cấp địa chỉ truy cập. Mở địa chỉ trên bằng trình duyệt để sử dụng ứng dụng.

**Lưu ý:** Smart Contract đã được triển khai trên Sepolia Testnet nên không cần chạy blockchain local hoặc deploy lại contract để xem dữ liệu.

## 5. Hướng dẫn sử dụng

### 5.1. Xem danh sách và kết quả kiểm định

1. Truy cập ứng dụng trên trình duyệt.
2. Quan sát các thẻ thống kê:
   - Total: Tổng số sản phẩm.
   - Passed: Số sản phẩm đạt kiểm định.
   - Failed: Số sản phẩm không đạt kiểm định.
   - Pending: Số sản phẩm chưa được kiểm định.
3. Xem bảng Inspection Records để tra cứu trạng thái từng sản phẩm.

Chức năng này không yêu cầu kết nối ví MetaMask.

### 5.2. Đăng ký sản phẩm (Manager)

1. Mở MetaMask và chuyển sang mạng Sepolia Testnet.
2. Chọn tài khoản ví Manager đã được cấp quyền.
3. Nhấn `Connect Wallet` trên giao diện.
4. Nhập Item ID chưa tồn tại trong hệ thống.
5. Nhấn nút đăng ký sản phẩm.
6. Xác nhận giao dịch trong MetaMask.
7. Chờ giao dịch được blockchain xác nhận.

Sau khi thành công, sản phẩm mới sẽ xuất hiện trong danh sách với trạng thái `Pending`.

### 5.3. Kiểm định sản phẩm (Inspector)

1. Mở MetaMask và chọn tài khoản Inspector.
2. Đảm bảo ví đang sử dụng mạng Sepolia Testnet.
3. Kết nối ví với ứng dụng.
4. Chọn sản phẩm có trạng thái `Pending`.
5. Chọn kết quả kiểm định:
   - `Passed`: Sản phẩm đạt yêu cầu.
   - `Failed`: Sản phẩm không đạt yêu cầu.
6. Gửi kết quả kiểm định.
7. Xác nhận giao dịch trong MetaMask.
8. Chờ blockchain xác nhận.

Sau khi giao dịch thành công, trạng thái sản phẩm và các số liệu thống kê sẽ được cập nhật.

**Lưu ý:** Một sản phẩm chỉ được kiểm định một lần. Không thể thay đổi kết quả sau khi đã ghi nhận thành công thông qua các chức năng hiện tại của Smart Contract.

## 6. Thông tin Smart Contract

Smart Contract được viết bằng Solidity và triển khai thông qua Remix IDE kết hợp với MetaMask.

**Mạng blockchain:** Ethereum Sepolia Testnet

**Địa chỉ Smart Contract:**

```text
0x0E6546D54002982d8F05416e24D7D1bcC2CF24Ac
```

**Xem Smart Contract trên Etherscan:**

https://sepolia.etherscan.io/address/0x0E6546D54002982d8F05416e24D7D1bcC2CF24Ac

Mã nguồn Smart Contract nằm tại:

```text
contracts/QualityInspection.sol
```

ABI được sử dụng trong frontend nằm tại:

```text
src/contracts/QualityInspectionABI.json
```

### Các hàm chính

| Hàm                     | Chức năng                     |
| ----------------------- | ----------------------------- |
| `registerItem()`        | Đăng ký sản phẩm mới          |
| `recordInspection()`    | Ghi nhận kết quả kiểm định    |
| `getInspectionResult()` | Truy vấn kết quả của sản phẩm |
| `getPassedCount()`      | Lấy số sản phẩm Passed        |
| `getAllItemIds()`       | Lấy danh sách Item ID         |

## 7. Lưu ý khi chạy ứng dụng

- Ứng dụng sử dụng Sepolia Testnet, không phải Ethereum Mainnet.
- Các giao dịch ghi dữ liệu yêu cầu ví MetaMask có đủ Sepolia ETH để trả phí gas.
- Chỉ ví Manager và Inspector đã được khai báo trong Smart Contract mới có quyền thực hiện các chức năng tương ứng.
- Người dùng clone repository có thể xem dữ liệu công khai nhưng không tự động có quyền Manager hoặc Inspector.
- Dữ liệu kiểm định được lưu trên blockchain, không bị mất khi tải lại trang.
- Ứng dụng tự động cập nhật dữ liệu từ blockchain theo chu kỳ khoảng 10 giây.
- Không cần deploy lại Smart Contract nếu chỉ muốn chạy frontend với contract hiện tại.

## 8. Mục đích dự án

Dự án được phát triển trong khuôn khổ môn học Blockchain Technology.

Mục tiêu là xây dựng một ứng dụng phi tập trung có giao diện người dùng, Smart Contract Solidity và khả năng kết nối Web3.

Thông qua dự án, nhóm thực hành:

- Phát triển Smart Contract bằng Solidity.
- Triển khai Smart Contract trên Ethereum Sepolia Testnet.
- Tích hợp React với blockchain thông qua ethers.js.
- Sử dụng MetaMask để xác thực tài khoản và ký giao dịch.
- Áp dụng cơ chế phân quyền và lưu trữ dữ liệu kiểm định trên blockchain.
