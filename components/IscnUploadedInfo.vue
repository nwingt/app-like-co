<template>
  <div class="flex flex-col mx-auto mt-[40px] w-min mb-[100px]">
    <Button
      :to="localeLocation({ name: 'index' })"
      preset="plain"
      tag="div"
      :text="$t('UploadForm.button.back')"
      class="text-dark-gray"
    >
      <template #prepend>
        <IconArrowLeft />
      </template>
    </Button>
    <Card :has-padding="false" set-padding-classes="p-[32px]">
      <!-- header -->
      <div class="flex flex-row items-start justify-between">
        <Label
          class="w-min"
          :text="$t('IscnUploaded.title')"
          tag="div"
          preset="p5"
          valign="middle"
          content-class="font-semibold whitespace-nowrap text-like-green"
          prepend-class="text-like-green"
        >
          <template #prepend>
            <IconDone />
          </template>
        </Label>
        <div class="flex flex-col items-end">
          <Stepper :step=4 />
          <Label preset="p6" text="Step 4/4" class="text-medium-gray" />
        </div>
      </div>
      <!-- guide title -->
      <Label
        :text="$t('IscnUploaded.guide.title')"
        class="text-medium-gray mt-[12px] mb-[28px]"
      />
      <!-- ISCN card -->
      <div
        class="
          flex
          w-[580px]
          h-[280px]
          justify-center
          items-center
          mb-[16px]
          rounded-[24px]
          bg-shade-gray
          text-white
        "
      >
        ISCN Card
      </div>
      <div class="flex flex-row justify-center items-center my-[16px]">
        <Button circle size="small" preset="tertiary" class="mx-[8px]">
          <IconUploadMini />
        </Button>
        <Button circle size="small" preset="tertiary" class="mx-[8px]">
          <IconDownload />
        </Button>
        <Button circle size="small" preset="tertiary" class="mx-[8px]">
          <IconShare />
        </Button>
      </div>
      <IconDiverMini class="mb-[24px]" />
      <Label
        class="w-min mb-[28px]"
        :text="type"
        tag="div"
        preset="p5"
        content-class="font-semibold whitespace-nowrap text-like-green"
        prepend-class="text-like-green"
      >
        <template #prepend>
          <ISCNTypeIcon :type="type" />
        </template>
      </Label>
      <FormField :label="$t('iscn.meta.name')" class="mb-[12px]">
        {{ name }}
      </FormField>
      <FormField :label="$t('iscn.meta.description')" class="mb-[12px]">
        {{ description }}
      </FormField>
      <IconDiverMini class="mb-[12px]" />
      <FormField :label="$t('iscn.meta.id')" class="mb-[12px]">
        {{ iscnId }}
      </FormField>
      <FormField
        :label="$t('iscn.meta.content.fingerprints')"
        class="mb-[12px]"
      >
        <ContentFingerprintLink :item="ipfs" />
      </FormField>
    </Card>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { getIPFSURLFromHash } from '~/utils/ipfs'
import { parsedISCNRecord } from '~/utils/cosmos/iscn'

const signerModule = namespace('signer')
const iscnModule = namespace('iscn')

@Component
export default class IscnUploadedInfo extends Vue {
  @Prop({ default: false }) readonly isImage!: boolean
  @Prop({ default: null }) readonly fileData: string | null | undefined
  @Prop({ default: null }) readonly exifInfo: any | null | undefined
  @Prop(String) readonly fileSHA256!: string
  @Prop(String) readonly ipfsHash!: string
  @Prop(String) readonly iscnId!: string
  @Prop(String) readonly iscnHash!: string
  @Prop(String) readonly iscnTimestamp!: string

  @signerModule.Getter('getAddress') currentAddress!: string
  @iscnModule.Action queryISCNByAddress!: (
    arg0: string
  ) => parsedISCNRecord[] | PromiseLike<parsedISCNRecord[]>

  records: parsedISCNRecord[] | null = null
  name = ''
  description = ''

  get imgSrc() {
    return this.isImage && (getIPFSURLFromHash(this.ipfsHash) || this.fileData)
  }

  get isPhoto() {
    return this.exifInfo && this.exifInfo.ExifImageWidth
  }

  get type() {
    if (this.isPhoto) return 'Photo'
    if (this.isImage) return 'Image'
    return 'CreativeWork'
  }

  get ipfs() {
    return `ipfs://${this.ipfsHash}`
  }

  async mounted() {
    this.records = await this.queryISCNByAddress(this.currentAddress)
    const { name, description } =
      this.records[this.records.length - 1].data.contentMetadata
    this.name = name
    this.description = description
  }
}
</script>
