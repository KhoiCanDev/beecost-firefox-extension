<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { KeyIcon } from "svelte-feather-icons"

  const dispatch = createEventDispatcher()

  const requestPermissions = () => {
    browser.permissions
      .request({
        origins: [
          "https://shopee.vn/*",
          "https://tiki.vn/*",
          "https://www.lazada.vn/*",
          "https://apiv3.beecost.vn/*"
        ]
      })
      .then((result) => {
        dispatch("permissionsResult", {
          state: result
        })
      })
    window.close()
  }
</script>

<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg max-w-lg w-64 h-80">
  <div class="px-5 py-5">
    <div class="flex flex-col items-center justify-center w-full h-full">
      <div>
        <KeyIcon
          class="loading-spin-animation text-black dark:text-white h-32 w-32" />
      </div>
      <p class="p-4 font-sans text-lg text-black dark:text-white text-center">
        Ứng dụng cần một số quyền để hoạt động
      </p>
      <button
        type="button"
        class="px-4 py-2 font-semibold text-sm rounded-full mt-2 bg-malachite-800 dark:bg-malachite-300 text-white dark:text-slate-800"
        on:click|once={requestPermissions}>Cho phép</button>
    </div>
  </div>
</div>
