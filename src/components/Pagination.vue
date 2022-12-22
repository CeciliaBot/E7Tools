<template>
  <ul class="pagination" v-if="totalPages > 1">
    <li class="pagination-item">
      <button
        type="button"
        class="material-button flat basic"
        @click="onClickFirstPage"
        :disabled="isInFirstPage"
        aria-label="Go to first page"
        v-ripple-effect
      >
        &lt;&lt;
      </button>
    </li>

    <li class="pagination-item">
      <button
        type="button"
        class="material-button flat basic"
        @click="onClickPreviousPage"
        :disabled="isInFirstPage"
        aria-label="Go to previous page"
        v-ripple-effect
      >
        &lt;
      </button>
    </li>

    <li v-for="page in pages" :key="page" class="pagination-item">
      <button
        type="button"
        @click="onClickPage(page.name)"
        :disabled="page.isDisabled"
        :class="['material-button flat basic', { activePage: isPageActive(page.name) }]"
        :aria-label="`Go to page number ${page.name}`"
        v-ripple-effect
      >
        {{ page.name }}
      </button>
    </li>

    <li class="pagination-item">
      <button
        type="button"
        class="material-button flat basic"
        @click="onClickNextPage"
        :disabled="isInLastPage"
        aria-label="Go to next page"
        v-ripple-effect
      >
        &gt;
      </button>
    </li>

    <li class="pagination-item">
      <button
        type="button"
        class="material-button flat basic"
        @click="onClickLastPage"
        :disabled="isInLastPage"
        aria-label="Go to last page"
        v-ripple-effect
      >
        &gt;&gt;
      </button>
    </li>
  </ul>
</template>

<script>
export default {
  name: "PaginationComponent",
  template: "#pagination",
  props: {
    maxVisibleButtons: {
      type: Number,
      required: false,
      default: 4,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    perPage: {
      type: Number,
      required: true,
    },
    currentPage: {
      type: Number,
      required: true,
    },
  },
  computed: {
    pages() {
      const range = [];
      var remainingLeft = 0;
      var remainingRight = 0;
      var endPage = this.currentPage + Math.floor(this.maxVisibleButtons / 2);
      var startPage = this.currentPage - Math.ceil(this.maxVisibleButtons / 2);
      if (endPage > this.totalPages)
        (remainingRight = endPage - this.totalPages),
          (endPage = this.totalPages);
      if (startPage < 1)
        (remainingLeft = Math.abs(1 - startPage)), (startPage = 1);
      endPage += remainingLeft;
      startPage -= remainingRight;
      if (endPage > this.totalPages) endPage = this.totalPages;
      if (startPage < 1) startPage = 1;

      for (let i = startPage; i <= endPage; i += 1) {
        if (i > 0) {
          range.push({
            name: i,
            isDisabled: i === this.currentPage,
          });
        }
      }

      return range;
    },
    isInFirstPage() {
      return this.currentPage === 1;
    },
    isInLastPage() {
      return this.currentPage === this.totalPages;
    },
  },
  methods: {
    onClickFirstPage() {
      this.$emit("pagechanged", 1);
    },
    onClickPreviousPage() {
      this.$emit("pagechanged", this.currentPage - 1);
    },
    onClickPage(page) {
      this.$emit("pagechanged", page);
    },
    onClickNextPage() {
      this.$emit("pagechanged", this.currentPage + 1);
    },
    onClickLastPage() {
      this.$emit("pagechanged", this.totalPages);
    },
    isPageActive(page) {
      return this.currentPage === page;
    }
  }
};
</script>

<style scoped>
    .pagination {
        list-style-type: none;
        text-align: center;
    }

    .pagination-item {
        display: inline-block;
        margin: 0 auto 0 auto;
    }
    .pagination-item button {
        height: 40px;
        min-width: 40px;
        cursor: pointer;
        outline: none;
    }

    @media screen and (max-width: 600px) { /* zoom pagintion buttons on small devices*/ 
        .pagination-item button {
            height: 50px;
            min-width: 40px;
        }
    }
    .pagination-item .activePage {
        background-color: rgb(102, 176, 205);
        color: #ffffff;
    }
</style>