<template>
    <div class="nsearchbar" style="display: inline-block; margin: 0; display: flex; flx: 1 1 auto; overflow: hidden; position: relative;" v-ripple-effect>
        <input ref="tierlist-maker-search-bar" v-bind="$attrs" style="background-color: #575656ad" placeholder="Search..." autocomplete="off">
        <div class="go" @click="$event.currentTarget.previousSibling.value = ''; $event.currentTarget.previousSibling.focus()">
            <i class="fa fa-search"></i>
        </div>
    </div>
</template>