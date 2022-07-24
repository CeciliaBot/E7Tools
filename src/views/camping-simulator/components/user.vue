<script>
export default {
    name: 'user-component',
    props: {type: {type: Number, default: 0}},
    inject: ['$computedUsers', '$computedProfile','switchUser'],
    data: function () {
        return {
            currAccount: {},
            accountList: [],
            currId: 0,
            accountSelection: false
        }
    },
    watch: {
        users: function (val) {
            console.log('changed accounts', val);
            this.accountList = val;
        },
        profile: function (val) {
            console.log("userChanged")
            this.currId = val;
            this.currAccount = this.accountList.filter(account => {return account.id == val})[0]||{};
        }
    },
    computed: {
        profile: function () {
            return this.$computedProfile();
        },
        users: function () {
            return this.$computedUsers();
        },
        selectableAccounts: function () {
            return this.accountList.filter(x => x.id != this.currId);
        },
    },
    created: function () {
    },
    mounted: function () {},
    methods: {
        setAsCurrentAccount: function (id) {
            this.accountSelection = false;
            this.switchUser(id);
        }
    },
    render: function (h) {
        return h('span', [
            this.type===0 ? h('div', {staticClass: 'noselect account-box', style: 'right: 0; top: 0;'}, [
                h('div', {staticClass: 'current-account-box', class: {open: this.accountSelection}, on: {click: () => this.accountSelection=!this.accountSelection}}, [
                    h('div', {staticClass: 'account-icon-box'}, [
                        h('img', {attrs: {src: /*this.currAccount.icon ||*/ 'https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/face/c0000_s.png'}, style: 'height: 100%;'})
                    ]),
                    h('div', {staticClass: 'account-body'}, [
                        h('div', {staticClass: 'account-name'}, this.currAccount.name)
                    ])
                ]),
                h('div', {staticClass: 'account-selection', style: {display: this.accountSelection ? '' : 'none'}},
                    this.selectableAccounts.map(account => {
                        return h('div', {staticClass: 'item', on: {click: () => this.setAsCurrentAccount(account.id) }}, account.name);
                    })
                )
            ]) : null,
            this.type===1? h('div', {staticClass: 'noselect account-box', style: 'right: 0; top: 0;'}, [
                h('div', {staticClass: 'current-account-box', on: {click: () => this.accountSelection=!this.accountSelection}}, [
                    h('i', {staticClass: 'fa fa-user'})
                ]),
                this.accountSelection ? h('div', {staticClass: 'modal'}, [
                    h('div', {staticClass: 'flat-modal'})
                ]) : null
            ]) : null,
        ])
    }
}
</script>
<style>
.account-box {
    display: inline-block;
    position: relative;
    vertical-align: middle;
    height: 80px;
    width: 200px;
    font-size: 18px;
    font-weight: normal;
}
.current-account-box {
    cursor: pointer;
    background-color: var(--background-color-tertiary);
    width: inherit;
    height: inherit;
    border-radius: 8px;
    padding: 10px;
    line-height: 60px;
}
.current-account-box.open {
    border-radius: 8px 8px 0 0;
}
.account-icon-box {
    display: inline-block;
    vertical-align: top;
    height: 60px;
    width: 60px;
    padding: 10px;
}
.account-body {
    display: inline-block;
}
.account-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 120px;
}
.account-selection {
    position: absolute;
    background-color: var(--background-color-tertiary);
    cursor: pointer;
    width: inherit;
    top: 100%;
    left: 0px;
    border-radius: 0 0 8px 8px;
    text-align: center;
    box-shadow: black 0px 17px 10px -10px inset;
}
.account-selection .item {
    padding: 10px 5px;
}
.account-selection .item:hover {
    background-color: #00000088;
    border-radius: inherit;
}
</style>