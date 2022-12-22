<template>
    <Modal v-if="camp && campData.team" @close="closeModal">
        <template v-slot:title>{{ $t(`strings.save_team`) }}</template>
        <div style="padding: 5px 10px 10px; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
            <div style="overflow: auto;">
                <div v-show="currSlide === 0">
                    <div style="text-align: center;">
                        <span>{{ $t(`strings.morale`) }}: {{ campData.morale }}</span>
                    </div>
                    <div style="text-align: center;">
                        <Formation
                            :team="campData.team"
                            :size="120"
                            :editable="true"
                            :add="addAndRemove"
                            :remove="addAndRemove"
                            :remove-original="false"
                            @added="calculateMorale"
                            @removed="calculateMorale"
                        />
                        <div style="text-align: center; display: inline-block; vertical-align: middle; margin: 0 20px">
                            <div v-for="i in 2" :key="i" >
                                <span>
                                    <b>{{ characterName(campData.holder[i-1]) }}</b>: {{ $t('strings.'+ campData.topics[i-1]) }}
                                </span>
                            </div>
                        </div>
                        <InputField ref="camp-name-input" v-model="campData.name" :required="true" :label="$t('strings.comp_name')" />
                        <InputField v-model="campData.description" :label="$t('strings.description')" />
                    </div>
                </div>
                <div v-show="currSlide===1">
                    <div style="text-align: center;">
                        <h2>{{ $t('strings.where_to_use_team') }}</h2>
                        <br>
                        <!-- The data provided here will also be used for statistics -->
                    </div>
                    <div style="text-align: center; padding-bottom: 5px;">
                        <MaterialCheckbox v-for="mode in ['labyrinth', 'azmakalis_normal', 'azmakalis_hell', 'azmakalis_nightmare']" :key="mode" color="rgb(255,20,20)" :checked="campData.gameMode.includes(mode)" @change="addGameMode(mode)" style="margin-left: 10px;">{{ $t('strings.'+mode) }}</MaterialCheckbox>
                    </div>
                    <div v-show="isRaidTeam" class="enemy-box">
                        <div v-for="enemy in raidEnemies"
                            :key="enemy[0]"
                            :class="['image-check', {enabled: this.campData.enemy.includes(enemy[0]) }]"
                            @click="addEnemy(enemy[0])"
                        >
                            <img :src="enemy[1]" />
                            <p>{{ $t(`strings.${enemy[0]}`) }}</p>
                        </div>
                        <div v-if="noRaidEnemiesSelected">
                            Select one or more enemies
                        </div>
                    </div>
                </div>
            </div>
            <div style="text-align: end">
                <button class="material-button basic primary noselect" @click="closeModal" v-ripple-effect>
                    <span>{{ $t('strings.close') }}</span>
                </button>
                <button v-show="currSlide>0" class="material-button basic primary noselect" style="float: left" @click="prevSlide" v-ripple-effect>
                    <span>{{ $t('strings.back') }}</span>
                </button>
                <button v-show="currSlide<maxSlides" class="material-button flat primary noselect" @click="nextSlide" v-ripple-effect>
                    <span>{{ $t('strings.next') }}</span>
                </button>
                <button v-show="currSlide===maxSlides" class="material-button flat confirm noselect" @click="save" v-ripple-effect>
                    <span>{{ $t('strings.save') }}</span>
                </button>
            </div>
        </div>
    </Modal>
</template>

<script>
import Modal from '@/layout/modal.vue'
import Formation from '@/components/TeamFormation.vue'
import InputField from '@/layout/MaterialStyleInput.vue'
import MaterialCheckbox from '@/layout/MaterialStyleCheckbox.vue'
import { enemies } from '../util/constant.js'

export default {
    components: {
        Modal,
        Formation,
        InputField,
        MaterialCheckbox
    },
    props: ['camp','editable','isnew'],
    data: function () {
        return {
            campData: {},
            currSlide: 0,
            maxSlides: 1,

            raidEnemies: enemies
        }
    },
    // created() {
    //     window.addEventListener('keydown', this.keyboardEnter)
    // },
    // beforeUnmount() {
    //     window.removeEventListener('keydown', this.keyboardEnter)
    // },
    watch: {
        camp: {
            immediate: true,
            handler(d) {
                this.copyData(d);
                this.currSlide=0;
            }
        }
    },
    computed: {
        isRaidTeam: function () {
            return ['azmakalis_normal', 'azmakalis_hell', 'azmakalis_nightmare'].some(mode => this.campData.gameMode.includes(mode) )
        },
        addAndRemove() {
            return false // this.campData._type === "friendship"
        },
        noRaidEnemiesSelected() {
            return this.isRaidTeam && !this.campData.enemy.length
        }
    },
    methods: {
        keyboardEnter(e) {
            if (e.code==="Enter")
                this.nextSlide();
        },
        nextSlide() {
            if (this.currSlide === 0 && !this.campData.name)
                return this.$refs['camp-name-input'].error();
            if (this.currSlide === 1) {
                this.save()
            } else
                return this.currSlide++
        },
        prevSlide() {
            return this.currSlide--
        },
        closeModal() {
            this.copyData({});
            this.currSlide=0;
            this.$emit('close')
        },
        save() {
            if (this.noRaidEnemiesSelected) {
                return this.$snackbar.error({title: 'Please select at least one enemy'})
            }
            this.campData.id = Date.now()
            this.$emit('save', JSON.parse(JSON.stringify(this.campData)) )
        },
        characterName: function (id) {
            return this.$store.getters.getHeroName(id);
        },

        copyData: function (data) {
            data = data || {}
            this.campData = JSON.parse(JSON.stringify(data))
            this.campData.morale = this.campData.morale || 0
            this.campData.name = this.campData.name || ''
            this.campData.description = this.campData.description || ''
            this.campData.team = this.campData.team || []
            this.campData.holder = this.campData.holder || []
            this.campData.topics = this.campData.topics || []
            this.campData.enemy = this.campData.enemy || []
            this.campData.gameMode = this.campData.gameMode || []
            this.campData.uploaded = this.campData.uploaded != undefined ? this.campData.uploaded : true   // we change this if upload to statistics api fails
        },

        addEnemy(enemy) {
            var index = this.campData.enemy.indexOf(enemy);
            if (index!==-1)
                this.campData.enemy.splice(index, 1)
            else
                this.campData.enemy.push(enemy);
        },
        addGameMode(mode) {
            var index = this.campData.gameMode.indexOf(mode);
            if (index!==-1)
                this.campData.gameMode.splice(index, 1)
            else
                this.campData.gameMode.push(mode);
            if (!this.isRaidTeam)
                this.campData.enemy = [];
        },

        calculateMorale() {
            // team has changed, need to recalculate morale
        }
    }
}
</script>
<style scoped>
    button {
        min-width: 100px;
    }
    .input-box {
        width: 100%;
        padding: 10px;
    }
    .enemy-box {
        height: auto;
        width: 100%;
        text-align: center;
        transition: opacity .4s ease;
        overflow: auto;
    }


    .image-check {
        position: relative;
        cursor: pointer;
        display: inline-flex;
        flex-direction: column;
        text-align: center;
        width: 84px;
        padding: 12px;
    }
    .image-check > img {
        width: 100%;
    }
    .image-check.enabled:after {
        transform: scale(1);
    }
    .image-check:after {
        content: "✓";
        position: absolute;
        left: 14%;
        top: 0;
        display: inline-block;
        height: 1.8em;
        width: 1.8em;
        transition-duration: 0.4s;
        transform: scale(0);
        text-align: center;
        line-height: 1.8em;
        z-index: 1;
        background-color: green;
        color: white;
        border-radius: 50%;
    }
</style>