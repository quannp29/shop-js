// show-alert
const showAlert = document.querySelector("[show-alert]");
if(showAlert) {
  let time = showAlert.getAttribute("data-time");
  time = parseInt(time);

  // Sau time giây sẽ đóng thông báo
  setTimeout(() => {
    showAlert.classList.add("alert-hidden");
  }, time);

  // Khi click vào nút close-alert sẽ đóng luôn
  const closeAlert = showAlert.querySelector("[close-alert]");
  closeAlert.addEventListener("click", () => {
    showAlert.classList.add("alert-hidden");
  });
}
// End show-alert

// Update Cart
const tableCart = document.querySelector("[table-cart]");
if(tableCart) {
  const listInputQuantity = tableCart.querySelectorAll("input[name='quantity']");
  listInputQuantity.forEach(input => {
    input.addEventListener("change", () => {
      const quantity = input.value;
      const productId = input.getAttribute("item-id");

      window.location.href = `/cart/update/${productId}/${quantity}`;
    });
  })
}
// End Update Cart

// Button Pagination
const listButtonPagination = document.querySelectorAll("[button-pagination]");
if(listButtonPagination.length > 0) {
  let url = new URL(window.location.href);

  listButtonPagination.forEach(button => {
    button.addEventListener("click", () => {
      const page = button.getAttribute("button-pagination");
      url.searchParams.set("page", page);
      
      window.location.href = url.href;
    });
  });
}
// End Button Pagination