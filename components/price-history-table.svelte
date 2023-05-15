<script lang="ts">
  import { DEFAULT_PRICE_FORMATTER } from "~util/system"

  export let priceHistoryRecords = []
</script>

<table
  class="mt-2 w-full table-auto border-collapse border border-slate-400 text-slate-800 dark:border-slate-200 dark:text-slate-100"
  id="lowest-price-table">
  <thead>
    <tr>
      <th
        class="border bg-blue-300 dark:bg-blue-800 border-slate-400 dark:border-slate-200 p-1 text-left"
        >Ngày</th>
      <th
        class="border bg-blue-300 dark:bg-blue-800 border-slate-400 dark:border-slate-200 p-1 text-right"
        >Giá</th>
      <th
        class="border bg-blue-300 dark:bg-blue-800 border-slate-400 dark:border-slate-200 p-1 text-right"
        >Giảm</th>
    </tr>
  </thead>
  <tbody>
    {#if priceHistoryRecords.length > 0}
      {#each priceHistoryRecords as priceHistoryRecord}
        <tr>
          <td class="border border-slate-400 dark:border-slate-200 p-1"
            >{priceHistoryRecord.date} ({priceHistoryRecord.daysAgo} ngày trước)</td>
          <td
            class="border border-slate-400 dark:border-slate-200 p-1 text-right"
            >{DEFAULT_PRICE_FORMATTER(priceHistoryRecord.price)}₫</td>
          <td
            class="border border-slate-400 dark:border-slate-200 p-1 text-right"
            >{priceHistoryRecord.discounted}%</td>
        </tr>
      {/each}
    {:else}
      <tr>
        <td
          class="border border-slate-400 dark:border-slate-200 p-2"
          colSpan="4">Không có dữ liệu</td>
      </tr>
    {/if}
  </tbody>
</table>
