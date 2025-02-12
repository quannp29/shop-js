// Button Status
const listButtonStatus = document.querySelectorAll("[button-status]");
if(listButtonStatus.length > 0) {
  let url = new URL(window.location.href);

  listButtonStatus.forEach((button) => {
    button.addEventListener("click", () => {
      const status = button.getAttribute("button-status");
      if(status) {
        url.searchParams.set("status", status);
      } else {
        url.searchParams.delete("status");
      }
      window.location.href = url.href;
    });
  });
}
// End Button Status

// Form Search
const formSearch = document.querySelector("#form-search");
if(formSearch) {
  let url = new URL(window.location.href);

  formSearch.addEventListener("submit", (event) => {
    event.preventDefault();

    const keyword = event.target.elements.keyword.value;
    
    if(keyword) {
      url.searchParams.set("keyword", keyword);
    } else {
      url.searchParams.delete("keyword");
    }
    
    window.location.href = url.href;
  });
}
// End Form Search

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

// Button Change Status
const listButtonChangeStatus = document.querySelectorAll("[button-change-status]");
if(listButtonChangeStatus.length > 0) {
  const formChangeStatus = document.querySelector("[form-change-status]");

  listButtonChangeStatus.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      const status = button.getAttribute("data-status");
      const path = formChangeStatus.getAttribute("data-path");

      const action = `${path}/${status}/${id}?_method=PATCH`;

      formChangeStatus.action = action;

      formChangeStatus.submit();
    });
  });
}
// End Button Change Status

// Table checkbox-multi
const tableCheckboxMulti = document.querySelector("[checkbox-multi]");
if(tableCheckboxMulti) {
  const inputCheckAll = tableCheckboxMulti.querySelector("input[name='checkall']");
  const listRowCheckBox = tableCheckboxMulti.querySelectorAll("input[name='id']");
  
  inputCheckAll.addEventListener("click", () => {
    if(inputCheckAll.checked) {
      listRowCheckBox.forEach(input => {
        input.checked = true;
      });
    } else {
      listRowCheckBox.forEach(input => {
        input.checked = false;
      });
    }
  });

  listRowCheckBox.forEach(inputId => {
    inputId.addEventListener("click", () => {
      const countInputIdChecked = tableCheckboxMulti.querySelectorAll("input[name='id']:checked").length;
      const lengthRowCheckbox = listRowCheckBox.length;
      
      if(countInputIdChecked == lengthRowCheckbox) {
        inputCheckAll.checked = true;
      } else {
        inputCheckAll.checked = false;
      }
    });
  });
}
// End Table checkbox-multi

// form-change-multi
const formChangeMulti = document.querySelector("[form-change-multi]");
if(formChangeMulti) {
  formChangeMulti.addEventListener("submit", (event) => {
    event.preventDefault();

    const type = formChangeMulti.querySelector("select[name='type']").value;
    
    const listRowCheckboxInputChecked = document.querySelectorAll("input[name='id']:checked");
    
    if(listRowCheckboxInputChecked.length > 0) {
      const ids = [];

      listRowCheckboxInputChecked.forEach(input => {
        const id = input.value;

        if(type == "change-position") {
          const position = input.closest("tr").querySelector("input[name='position']").value;
          ids.push(`${id}-${position}`);
        }
        else {
          ids.push(id);
        }
      });

      const stringIds = ids.join(", ");
      const input = formChangeMulti.querySelector("input[name='ids']");
      input.value = stringIds;

      if(type == "delete-all") {
        const isConfirm = confirm("Bạn có chắc muốn xóa những bản ghi này?");
        if(!isConfirm) {
          return;
        }
      }

      formChangeMulti.submit();
    } else {
      alert("Vui lòng chọn ít nhất 1 bản ghi!");
    }
  });
}
// End form-change-multi

// button-delete
const listButtonDelete = document.querySelectorAll("[button-delete]");
if(listButtonDelete.length > 0) {
  const formDeleteItem = document.querySelector("[form-delete-item]");
  
  listButtonDelete.forEach(button => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn có chắc muốn xóa?");
      
      if(isConfirm) {
        const id = button.getAttribute("data-id");
        const path = formDeleteItem.getAttribute("data-path");
  
        const action = `${path}/${id}?_method=DELETE`;
  
        formDeleteItem.action = action;
  
        formDeleteItem.submit();
      }
      
    });
  });
}
// End button-delete

// button-restore
const listButtonRestore = document.querySelectorAll("[button-restore]");
if(listButtonRestore.length > 0) {
  const formRestore = document.querySelector("[form-restore]");

  listButtonRestore.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      const path = formRestore.getAttribute("data-path");

      const action = `${path}/${id}?_method=PATCH`;

      formRestore.action = action;

      formRestore.submit();
    });
  });
}
// End button-restore

// form-restore-multi
const formRestoreMulti = document.querySelector("[form-restore-multi]");
if(formRestoreMulti) {
  formRestoreMulti.addEventListener("submit", (event) => {
    event.preventDefault();
    
    const listRowCheckboxInputChecked = document.querySelectorAll("input[name='id']:checked");
    
    if(listRowCheckboxInputChecked.length > 0) {
      const ids = [];

      listRowCheckboxInputChecked.forEach(input => {
        const id = input.value;
        ids.push(id);
      });

      const stringIds = ids.join(", ");
      const input = formRestoreMulti.querySelector("input[name='ids']");
      input.value = stringIds;

      formRestoreMulti.submit();
    } else {
      alert("Vui lòng chọn ít nhất 1 bản ghi!");
    }
  });
}
// End form-restore-multi

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

// upload-image
const uploadImage = document.querySelector("[upload-image]");
if(uploadImage) {
  const uploadImageInput = uploadImage.querySelector("[upload-image-input]");
  const uploadImagePreview = uploadImage.querySelector("[upload-image-preview]");
  
  uploadImageInput.addEventListener("change", () => {
    const file = uploadImageInput.files[0];
    if(file) {
      uploadImagePreview.src = URL.createObjectURL(file);
    }
  });
}
// End upload-image

const sort = document.querySelector("[sort]");
if(sort) {
  let url = new URL(window.location.href);
  const sortSelect = sort.querySelector("[sort-select]");

  // Lắng nghe thay đổi sắp xếp
  sortSelect.addEventListener("change", () => {
    const [sortKey, sortValue] = sortSelect.value.split("-");
    
    if(sortKey && sortValue) {
      url.searchParams.set("sortKey", sortKey);
      url.searchParams.set("sortValue", sortValue);
    }
    else {
      url.searchParams.delete("sortKey");
      url.searchParams.delete("sortValue");
    }
    window.location.href = url.href;
  });

  // Thêm selected cho lựa chọn hiện tại
  const selectedSortKey = url.searchParams.get("sortKey");
  const selectedSortValue = url.searchParams.get("sortValue");
  
  if(selectedSortKey && selectedSortValue) {
    const stringSort = `${selectedSortKey}-${selectedSortValue}`;
    const optionSelected = sortSelect.querySelector(`option[value='${stringSort}']`);
    optionSelected.selected = true;
  }
}
// End Sort

// sort-clear
const buttonSortClear = document.querySelector("[sort-clear]");
if(buttonSortClear) {
  let url = new URL(window.location.href);

  buttonSortClear.addEventListener("click", () => {
    url.searchParams.delete("sortKey");
    url.searchParams.delete("sortValue");

    window.location.href = url.href;
  });

}
// End sort-clear

// Table permissions
const buttonSubmitPermissions = document.querySelector("[button-submit-permissions]");
if(buttonSubmitPermissions) {
  buttonSubmitPermissions.addEventListener("click", () => {
    const roles = [];
    const tablePermissions = document.querySelector("[table-permissions]");
    const rows = tablePermissions.querySelectorAll("tbody tr[data-name]");

    rows.forEach((row, index) => {
      const dataName = row.getAttribute("data-name");
      const inputs = row.querySelectorAll("input");

      if(dataName == "id") {
        inputs.forEach(input => {
          const id = input.value;
          roles.push({
            id: id,
            permissions: []
          });
        })
      }
      else {
        inputs.forEach((input, index) => {
          const inputChecked = input.checked;
          if(inputChecked) {
            roles[index].permissions.push(dataName);
          }
        })
      }
    });

    if(roles.length > 0) {
      const formChangePermissions = document.querySelector("[form-change-permissions]");
      const inputRoles = formChangePermissions.querySelector("input[name='roles']");
      inputRoles.value = JSON.stringify(roles);
      formChangePermissions.submit();
    }
  });
}
// End Table permissions

// Data default table permissions
const dataRecords = document.querySelector("[data-records]");
if(dataRecords) {
  const records = JSON.parse(dataRecords.getAttribute("data-records"));
  const tablePermissions = document.querySelector("[table-permissions]");

  records.forEach((record, index) => {
    const permissions = record.permissions;
    permissions.forEach((item) => {
      const row = tablePermissions.querySelector(`tr[data-name="${item}"]`);
      const inputs = row.querySelectorAll("input");
      inputs[index].checked = true;
    });
  })
}
// End Data default table permissions