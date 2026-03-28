import toast from "react-hot-toast";

export const useToast = () => {
  const showSuccess = (message) => {
    toast.success(message, {
      duration: 3000,
      style: {
        border: "1px solid #86efac", // Tailwind green-300
        padding: "16px",
        color: "#15803d", // Tailwind green-700
        backgroundColor: "#f0fdf4", // Tailwind green-50
        fontWeight: "500",
      },
      iconTheme: {
        primary: "#15803d",
        secondary: "#f0fdf4",
      },
    });
  };

  const showError = (message) => {
    toast.error(message, {
      duration: 4000,
      style: {
        border: "1px solid #fca5a5", // Tailwind red-300
        padding: "16px",
        color: "#b91c1c", // Tailwind red-700
        backgroundColor: "#fef2f2", // Tailwind red-50
        fontWeight: "500",
      },
      iconTheme: {
        primary: "#b91c1c",
        secondary: "#fef2f2",
      },
    });
  };

  const showLoading = (message) => {
    return toast.loading(message, {
      style: {
        padding: "16px",
        fontWeight: "500",
      },
    });
  };

  const dismissToast = (toastId) => {
    toast.dismiss(toastId);
  };

  return { showSuccess, showError, showLoading, dismissToast };
};