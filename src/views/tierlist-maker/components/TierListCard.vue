<template>
    <div class="tier-card"  @click.prevent="this.$emit('load', tierlist)">
        <EmotableBox class="title" tagName="h2" :editable="false" :value="tierlist.name" />
        <div class="body">
            <div class="description">
                <div>
                    <span>{{ $t('strings.tier_list_type') }}: {{ tierlist.type }}</span>
                </div>
                <div>
                    <span>{{ $t('strings.updated_at') }}: {{ tierlist.updated_at ? $d(tierlist.updated_at, 'long') : '-' }}</span>
                </div>
                <div>
                    <span>{{ $t('strings.created_at') }}: {{ tierlist.created_at ? $d(tierlist.created_at, 'long') : '-' }}</span>
                </div>
            </div>
            <button v-if="buttons" class="material-button stroked primary" style="float: left;" v-ripple-effect><span>{{ $t('strings.load') }}</span></button>
            <button v-if="buttons" @click.stop="this.$emit('delete', tierlist)" class="material-button flat warn" style="float: right;" v-ripple-effect><span>{{ $t('strings.delete') }}</span></button>
        </div>
    </div>
</template>
<script>
import emoteEditableBoxComponent from '@/components/EmoteableDiv.vue'
export default {
    name: 'TierListCard',
    components: {
        EmotableBox: emoteEditableBoxComponent
    },
    props: {
        tierlist: {
            type: Object,
            required: true
        },
        buttons: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        name: function () {
            return this.tierlist.name//stringToHtmlEmotes(this.tierlist.name)
        }
    }
}
</script>
<style>
.tier-card {
    display: flex;
    cursor: pointer;
    flex-direction: column;
    justify-content: space-between;
    vertical-align: top;
    width: 240px;
    background-color: var(--background-color-tertiary);
    border-radius: 8px;
    margin: 5px 20px;
    padding: 10px;
}
.tier-card .title {
    margin: 5px 0 10px;
    -webkit-line-clamp: 2;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
}
.tier-card .description {
    font-size: 0.8em;
    font-weight: 200;
}
</style>