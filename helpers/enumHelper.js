const HTTP_STATUS = {
    OK: "200",
    CREATED: "201",
    NO_CONTENT: "204",
    BAD_REQUEST: "400",
    UNAUTHORIZED: "401",
    FORBIDDEN: "403",
    NOT_FOUND: "404",
    METHOD_NOT_ALLOWED: "405",
    INTERNAL_SERVER_ERROR: "500",
    SERVICE_UNAVAILABLE: "503",
};

const STATUS_MESSAGE = {
    CRED_NOT_FOUND: "Email tidak terdaftar.",
    USER_LOGGEDIN: "Pengguna telah masuk.",
    SUCCESS_LOGIN: "Login berhasil.",
    ERR_AUTH: "Kesalahan dalam mengautentikasi pengguna: ",
    INVALID_JDE: "Kata sandi salah, masukkan kata sandi yang benar.",
    SUCCESS_LOGOUT: "Pengguna berhasil keluar.",
    FAILED_LOGOUT: "Gagal keluar dari sistem.",
    ERR_LOGOUT: "Kesalahan saat keluar dari sistem:",
    SUCCESS_RESET_PASS: "Berhasil mereset kata sandi.",
    ERR_RESET_PASS: "Kesalahan saat mereset kata sandi:",
    SUCCESS_CREATE_USER: "Pengguna berhasil dibuat.",
    ERR_CREATE_USER: "Gagal membuat pengguna.",
    FAILED_GET_USER: "Gagal mengambil data pengguna.",
    FAILED_GET_ALL_USER: "Kesalahan dalam mengambil semua pengguna:",
    FAILED_PAGINATED_USER: "Kesalahan dalam mengambil pengguna secara paginasi:",
    SUCCESS_UPDATE_USER: "Pengguna berhasil diperbarui.",
    ERR_UPDATE_USER: "Kesalahan saat memperbarui pengguna:",
    SUCCESS_DEL_USER: "Pengguna berhasil dihapus dari database.",
    ERR_DEL_USER: "Kesalahan dalam menghapus pengguna: ",
    ERR_GET_ROLES: "Gagal mengambil semua peran.",
    ORDER_NOT_FOUND: "Order tidak ditemukan"
};

const ORDER_STATUS = {
    ACTIVE: "Active",
    CANCELLED: "Cancelled",
    DRIVER_CONFIRMED: "Driver confirmed",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    PENDING: "Pending",
    ORDER_RECEIVED: "Order Received",
    BERANGKAT: "Berangkat",
    SAMPAI: "Sampai"

}


module.exports = {
    HTTP_STATUS,
    STATUS_MESSAGE,
    ORDER_STATUS
}
