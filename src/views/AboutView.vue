<template>
  <!-- 纯内容区容器 -->
  <div class="content-wrapper">
    <van-pull-refresh v-model="refreshing" @refresh="handleRefresh">
      <div>sdf</div>
      <Waterfall
        :list="dataList"
        :width="columnWidth"
        :gutter="8"
        @scroll-reach-bottom="loadMore"
      >
        <template #default="{ item }">
          <div class="post-card" :style="{ height: item.height + 'px' }">
            <!-- 视频类型 -->
            <video
              v-if="item.type === 'video'"
              controls
              :poster="item.cover"
              class="media"
            >
              <source :src="item.url" type="video/mp4" />
            </video>
            <!-- 图片类型 -->
            <img v-else :src="item.url" :alt="item.title" class="media" />

            <div class="post-info">
              <h3 class="title">{{ item.title }}</h3>
              <div class="meta">
                <span class="author">{{ item.author }}</span>
                <span class="likes">❤ {{ item.likes }}</span>
              </div>
            </div>
          </div>
        </template>
      </Waterfall>

      <van-loading v-if="loading" class="loader">加载中...</van-loading>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { PullRefresh, Loading } from "vant";
import { LazyImg, Waterfall } from "vue-waterfall-plugin-next";

const route = useRoute();
const dataList = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const page = ref(1);

// 动态列宽计算
const columnWidth = computed(() => {
  const viewportWidth = window.innerWidth;
  return Math.floor((viewportWidth - 24) / 2); // 留出安全边距
});

// 数据生成器
const generateItem = (index) => ({
  id: `post-${Date.now()}-${index}`,
  title: `精彩内容 ${index + 1}`,
  type: Math.random() > 0.5 ? "image" : "video",
  url:
    Math.random() > 0.5
      ? `https://picsum.photos/300/${400 + Math.floor(Math.random() * 200)}`
      : "https://vjs.zencdn.net/v/oceans.mp4",
  cover: `https://picsum.photos/300/200?random=${index}`,
  author: `用户${Math.floor(Math.random() * 1000)}`,
  likes: Math.floor(Math.random() * 1000),
  height: 300 + Math.floor(Math.random() * 200),
});

// 模拟数据加载
const fetchData = async () => {
  return new Array(10)
    .fill(null)
    .map((_, i) => generateItem(i + page.value * 10));
};

// 刷新处理
const handleRefresh = async () => {
  page.value = 1;
  dataList.value = await fetchData();
  refreshing.value = false;
};

// 加载更多
const loadMore = async () => {
  if (loading.value) return;
  loading.value = true;
  page.value += 1;
  dataList.value = [...dataList.value, ...(await fetchData())];
  loading.value = false;
};

onMounted(handleRefresh);
</script>

<style scoped>
.content-wrapper {
  padding: 12px;
  background: #f0f0f0;
  min-height: 100vh;
}

.post-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
}

.media {
  width: 100%;
  display: block;
  object-fit: cover;
}

video.media {
  aspect-ratio: 16/9;
}

.post-info {
  padding: 8px 12px;
}

.title {
  font-size: 14px;
  margin: 0 0 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.loader {
  padding: 16px 0;
  text-align: center;
}
</style>
