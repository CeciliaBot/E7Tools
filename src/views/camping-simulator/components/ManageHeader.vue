<template>
    <div class="nav-camping-base">
        <div class="nMobile-nav">
            <button @click="moreMenu">
                <i class="fa fa-bars"></i>
            </button>
            <div class="nsearchbar" v-ripple-effect>
                <input id="camp_heroesw_input" autocomplete="off" :value="searchQuery" :placeholder="this.$t('strings.search')" @input="updateQuery" />
                <div class="go" @click="handleGoSearchBar">
                    <i :class="['fa', !this.searchQuery ? 'fa-search' : 'fa-times']"></i>
                </div>
            </div>
            <button @click="filter">
                <i class="fa fa-filter"></i>
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CampManageHeader',
    emits: ['more', 'filter', 'search'],
    props: {
        mobile: {
            default: false
        }
    },
    data() {
        return {
            searchQuery: ''
        }
    },
    methods: {
        updateQuery(e) {
            this.searchQuery=e.target.value;
            this.$emit('search', this.searchQuery)
        },
        moreMenu(e) {
            this.$emit('more', e)
        },
        filter(e) {
            this.$emit('filter', e)
        },
        handleGoSearchBar() {
            if (this.searchQuery) {
                this.searchQuery = '';
                if (!this.mobile) document.getElementById('camp_heroesw_input').focus()
            }
        }
    }
}
</script>

<style>

</style>