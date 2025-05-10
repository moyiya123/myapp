<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { PullRefresh, Toast } from "vant";
import { LazyImg, Waterfall } from "vue-waterfall-plugin-next";
import { mockFetchData } from "../api/mock";
import { useWindowSize } from "@vueuse/core";

const route = useRoute();
const { width } = useWindowSize();

// 响应式布局计算
const itemWidth = computed(() => Math.floor((width.value - 30) / 2));

const list = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const page = ref(1);

// 根据URL参数生成不同数据
const getQueryParams = () => ({
  format: ["json", "xml"].includes(route.query.format)
    ? route.query.format
    : "json",
  type: route.query.type || "mixed",
});

// 数据加载逻辑
const loadData = async (reset = false) => {
  if (loading.value) return;
  loading.value = true;

  try {
    const params = {
      page: reset ? 1 : page.value,
      ...getQueryParams(),
    };
    const data = await mockFetchData(params);

    if (reset) {
      list.value = data;
      page.value = 2;
    } else {
      list.value = [...list.value, ...data];
      page.value++;
    }
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true;
  loadData(true);
};

// 上拉加载
const loadMore = () => !refreshing.value && loadData();

onMounted(() => loadData(true));
</script>

<template>
  <div class="container">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      水电费水电费
      <Waterfall
        :list="list"
        :gutter="10"
        :width="itemWidth"
        @scroll-reach-bottom="loadMore"
      >
        <template #item="{ item }">
          <div class="card">
            <h3 class="title">{{ item.title }}</h3>
            <video
              v-if="item.type === 'video'"
              controls
              :poster="item.cover"
              :src="item.url"
              class="media"
            />
            <img v-else :src="item.url" :alt="item.title" class="media" />
          </div>
        </template>
      </Waterfall>

      <van-loading v-if="loading" vertical>加载中...</van-loading>
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.container {
  padding: 12px;
  min-height: 100vh;
}

.card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
}

.title {
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
}

.media {
  width: 100%;
  display: block;
  aspect-ratio: var(--aspect-ratio, 3/4);
  object-fit: cover;
}
</style>
