<template>
  <div>
    <div
      v-for="(field, i) in fields"
      :key="field.key"
      :class="[
        'flex',
        'flex-row',
        'items-center',
        'justify-center'
    ]"
    >
      <div v-if="$slots.prepend" class="mr-[4px]">
        <slot name="prepend" />
      </div>
      <TextField
        :size="40"
        :class="[
          'my-[4px]',
          'flex-grow',
        ]"
        :placeholder="placeholder"
      />
      <span
        :class="[
          'ml-[12px]',
          'cursor-pointer',
        ]"
        @click="deleteField(i)"
      ><IconCloseMini /></span>
    </div>
    <Button
      class="mx-auto my-[4px]"
      preset="secondary"
      :text-preset="textPreset"
      :label-tag="labelTag"
      :text="text"
      size="mini"
      prepend-class="mr-[4px]"
      @click="addFields"
    >
      <template #prepend>
        <IconAddMini />
      </template>
    </Button>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class TextFieldList extends Vue {
  @Prop(String) readonly text!: String
  @Prop(String) readonly placeholder!: String
  @Prop(String) readonly textPreset!: String
  @Prop(String) readonly labelTag!: String

  fields: any = [{ key: 0 }]

  addFields() {
    this.fields.push({
      key: Date.now(),
    })
  }

  deleteField(index: number) {
    this.fields.splice(index, 1)
  }
}
</script>
