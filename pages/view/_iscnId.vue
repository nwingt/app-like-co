<template>
  <Page
    v-if="!record"
    class="justify-center"
  >
    <Card>
      <Label :text="$t('general.loading')" />
    </Card>
  </Page>
  <Page v-else>
    <div
      :class="[
        'container',
        'flex',
        'flex-row',
        'flex-nowrap',
        'items-start',
        'w-min',
        'mx-auto',
        'mt-[16px]',
        'mb-[30px]',
      ]"
    >
      <div class="mr-[32px]">
        <MetadataCard v-if="imgSrc" :img-src="imgSrc" />
      </div>
      <div>
        <InfoCard :label-text="type" :time-stamp="record.recordTimestamp">
          <template #icon>
            <ISCNTypeIcon :type="type" />
          </template>
          <FormField
            v-if="name"
            :label="$t('iscn.meta.name')"
            content-type="strong"
            class="mb-[12px]"
          >
            {{ name }}
          </FormField>
          <FormField
            v-if="metadata.description"
            :label="$t('iscn.meta.description')"
            class="mb-[12px]"
          >
            {{ metadata.description }}
          </FormField>
          <FormField
            v-if="owner"
            :label="$t('iscn.meta.owner')"
            class="mb-[12px]"
          >
            {{ owner }}
          </FormField>
          <IconDiverMini class="my-[12px]" />
          <FormField
            v-if="iscnId"
            :label="$t('iscn.meta.id')"
            class="mb-[12px]"
          >
            {{ iscnId }}
          </FormField>
          <FormField
            :label="$t('iscn.meta.content.fingerprints')"
            class="mb-[12px]"
          >
            <ContentFingerprintLink
              v-for="item in record.contentFingerprints"
              :key="item.key"
              :item="item"
              class="mb-[8px] break-all"
            />
          </FormField>
          <IconDiverMini class="my-[12px]" />
          <FormField :label="$t('iscn.meta.tags.title')" class="mb-[12px]">
            <Tag
              v-for="item in keywords"
              :key="item.key"
              :text="item"
              class="mr-[8px]"
            />
          </FormField>
        </InfoCard>
        <InfoCard :label-text="$t('iscn.meta.metadata.title')">
          <template #icon>
            <IconMetadata />
          </template>
          <FormField
            v-for="(stakeholder, index) in stakeholders"
            :key="stakeholder.key"
            :label="$t('iscn.meta.stakeholders')"
            class="mb-[12px]"
          >
            <StakeholderInfo
              :id="stakeholders[index].entity.id"
              :address="stakeholders[index].entity['@id']"
              :url="stakeholders[index].entity.url"
              :name="stakeholders[index].entity.name"
            />
          </FormField>
          <FormField
            v-if="metadata.version"
            :label="$t('iscn.meta.version')"
            class="mb-[12px]"
          >
            {{ metadata.version }}
          </FormField>
          <FormField
            v-if="metadata.url"
            :label="$t('iscn.meta.url')"
            class="mb-[12px]"
          >
            <Link :href="metadata.url">
              {{ metadata.url }}
            </Link>
          </FormField>
          <FormField
            v-if="metadata.usageInfo"
            :label="$t('iscn.meta.usage.info')"
            class="mb-[12px]"
          >
            <Link :href="metadata.usageInfo">
              {{ metadata.usageInfo }}
            </Link>
          </FormField>
        </InfoCard>
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { isCosmosTransactionHash } from '~/utils/cosmos'
import { getIPFSUrlFromISCN } from '~/utils/cosmos/iscn/view'
import { parsedISCNRecord } from '~/utils/cosmos/iscn'
import { ISCN_PREFIX } from '~/constant'

const iscnModule = namespace('iscn')

export enum ErrorMessage {
  statusCode400 = 'not iscn id or tx hash',
  statusCode404 = 'iscn id not found',
}

@Component
export default class ViewIscnIdPage extends Vue {
  owner = ''
  iscnId = ''

  @iscnModule.Getter getISCNById!: (arg0: string) => parsedISCNRecord
  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<{
    records: parsedISCNRecord[]
    owner: string
    latestVersion: Long.Long
  } | null>

  @iscnModule.Action fetchISCNByTx!: (
    arg0: string
  ) => Promise<{ records: parsedISCNRecord[] }>

  get record() {
    return this.getISCNById(this.iscnId)?.data
  }

  get metadata() {
    return this.record && (this.record as any).contentMetadata
  }

  get type() {
    return this.metadata && this.metadata['@type']
  }

  get imgSrc() {
    return (
      (this.type === 'Image' || this.type === 'Photo') &&
      getIPFSUrlFromISCN(this.getISCNById(this.iscnId))
    )
  }

  get name() {
    return this.metadata.name || this.metadata.title
  }

  get keywords(): Array<string> {
    return this.metadata.keywords ? this.metadata.keywords.split(',') : []
  }

  get stakeholders() {
    return this.record.stakeholders
  }

  created() {
    const { iscnId } = this.$route.params
    if (iscnId.startsWith(ISCN_PREFIX)) {
      this.iscnId = iscnId
    }
  }

  async mounted() {
    if (!this.iscnId) {
      const param = this.$route.params.iscnId
      if (!isCosmosTransactionHash(param)) {
        this.$nuxt.error({
          statusCode: 400,
          message: ErrorMessage.statusCode400,
        })
        return
      }
      const res = await this.fetchISCNByTx(param)
      if (!res) {
        this.$nuxt.error({
          statusCode: 400,
          message: ErrorMessage.statusCode400,
        })
        return
      }
      this.iscnId = res.records[0].id
      this.$router.replace({ params: { iscnId: this.iscnId } })
    }
    if (!this.getISCNById(this.iscnId) || !this.owner) {
      const res = await this.fetchISCNById(this.iscnId)
      if (res) this.owner = res.owner
    }
    if (!this.getISCNById(this.iscnId)) {
      this.$nuxt.error({ statusCode: 404, message: ErrorMessage.statusCode404 })
    }
  }
}
</script>
