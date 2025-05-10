<template>
  <div
    class="container"
    @scroll.passive="handleScroll"
    @touchstart="startTouch"
    @touchmove="moveTouch"
    @touchend="endTouch"
  >
    <!-- 下拉刷新提示 -->
    <div
      class="refresh-indicator"
      :style="{ transform: `translateY(${pullDistance}px)` }"
    >
      <span v-if="!isRefreshing">
        {{ pullDistance > 70 ? "释放刷新" : "下拉刷新" }}
      </span>
      <div v-else class="loading-spinner"></div>
    </div>
    <!-- 两列容器 -->
    <div class="double-column-wrapper">
      <!-- 左列 -->
      <div class="column left-col">
        <div
          v-for="item in leftColumnItems"
          :key="item.id"
          class="card-item"
          :style="{ height: item.height + 'px' }"
        >
          <!-- 图片内容 -->
          <img
            v-if="item.type === 'image'"
            v-lazy="item.url"
            class="media-content"
            :alt="item.title"
          />

          <!-- 视频内容 -->
          <video
            v-else
            ref="videoPlayers"
            class="media-content"
            :poster="item.poster"
            controls
            @click="handleVideoClick(item.id)"
            @play="pauseOtherVideos(item.id)"
          >
            <source :src="item.url" type="video/mp4" />
          </video>

          <div class="content-info">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>

      <!-- 右列 -->
      <div class="column right-col">
        <!-- <div
          v-for="(item, index) in rightColumnItems"
          :key="item.id"
          class="card-item"
          :style="{ height: item.height + 'px' }"
        >
          <img v-lazy="item.image" class="card-image" alt="商品图片" />
          <div class="card-content">
            <h3 class="title">{{ item.title }}</h3>
          </div>
        </div> -->
        <div
          v-for="item in rightColumnItems"
          :key="item.id"
          class="card-item"
          :style="{ height: item.height + 'px' }"
        >
          <!-- 图片内容 -->
          <img
            v-if="item.type === 'image'"
            v-lazy="item.url"
            class="media-content"
            :alt="item.title"
          />

          <!-- 视频内容 -->
          <video
            v-else
            ref="videoPlayers"
            class="media-content"
            :poster="item.poster"
            controls
            @click="handleVideoClick(item.id)"
            @play="pauseOtherVideos(item.id)"
          >
            <source :src="item.url" type="video/mp4" />
          </video>

          <div class="content-info">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- 底部加载提示 -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="loading-spinner"></div>
      正在加载...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const props = defineProps({
  type: {
    type: String,
    required: false,
    default: "",
  },
  sort: {
    type: String,
    validator: (value) => ["default", "latest", "top"].includes(value),
    default: "default",
  },
});
console.log(route.query, "sdfsdfsdfsd");
// 模拟数据
const items = ref([]);
// 新增状态管理
const isLoading = ref(false);
const isRefreshing = ref(false);
const pullStartY = ref(0);
const pullDistance = ref(0);
const lastScrollTop = ref(0);
const SCROLL_THRESHOLD = 100; // 距底部100px触发加载
// 初始化数据
const initData = () => {
  const mockData = [];
  if (route.query.type) {
    for (let i = 0; i < 20; i++) {
      mockData.push({
        id: Date.now() + i,
        type: Math.random() > 0.5 ? "image" : "video",
        url: `https://media.example.com/${
          Math.random() > 0.5 ? "img" : "vid"
        }_${i}.${Math.random() > 0.5 ? "jpg" : "mp4"}`,
        poster: "https://via.placeholder.com/300x200",
        title: `我是不一样的内容标题 ${i + 1}`,
        description: "我是不一样的内容...",
        height: 200 + Math.floor(Math.random() * 100),
      });
    }
  } else {
    for (let i = 0; i < 20; i++) {
      mockData.push({
        id: Date.now() + i,
        type: Math.random() > 0.5 ? "image" : "video",
        url: `https://media.example.com/${
          Math.random() > 0.5 ? "img" : "vid"
        }_${i}.${Math.random() > 0.5 ? "jpg" : "mp4"}`,
        poster: "https://via.placeholder.com/300x200",
        title: `内容标题 ${i + 1}`,
        description: "内容描述文字...",
        height: 200 + Math.floor(Math.random() * 100),
      });
    }
  }

  items.value = mockData;
}; // 触摸事件处理
let touchStartY = 0;

const startTouch = (e) => {
  if (window.scrollY === 0) {
    touchStartY = e.touches[0].clientY;
  }
};

const moveTouch = (e) => {
  if (!touchStartY) return;

  const touchY = e.touches[0].clientY;
  const deltaY = touchY - touchStartY;

  if (deltaY > 0 && window.scrollY === 0) {
    e.preventDefault();
    pullDistance.value = Math.min(deltaY * 0.6, 150);
  }
};

const endTouch = () => {
  if (pullDistance.value > 70) {
    refreshData();
  }
  touchStartY = 0;
  pullDistance.value = 0;
};

// 滚动处理
const handleScroll = (e) => {
  const container = e.target;
  const { scrollTop, scrollHeight, clientHeight } = container;

  // 下拉刷新判断
  if (scrollTop < -50 && !isRefreshing.value) {
    refreshData();
  }

  // 上拉加载判断
  if (
    scrollHeight - (scrollTop + clientHeight) < SCROLL_THRESHOLD &&
    !isLoading.value
  ) {
    loadMoreData();
  }

  lastScrollTop.value = scrollTop;
};

// 数据加载方法
const loadMoreData = async () => {
  if (isLoading.value) return;

  isLoading.value = true;
  try {
    // 模拟API请求
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newData = generateNewData(items.value.length);
    items.value = [...items.value, ...newData];
  } finally {
    isLoading.value = false;
  }
};
// 视频控制逻辑
const handleVideoClick = (videoId) => {
  const videoEl = contentList.value.find((item) => item.id === videoId)?.$el;
  if (videoEl.paused) {
    videoEl.play();
  } else {
    videoEl.pause();
  }
};

const pauseOtherVideos = (currentId) => {
  contentList.value.forEach((item) => {
    if (item.type === "video" && item.id !== currentId) {
      item.$el.pause();
    }
  });
};

const refreshData = async () => {
  if (isRefreshing.value) return;

  isRefreshing.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 800));
    items.value = generateNewData(0);
  } finally {
    isRefreshing.value = false;
  }
};

// 数据生成方法
const generateNewData = (start) => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: Date.now() + i,
    type: Math.random() > 0.5 ? "image" : "video",
    url:
      Math.random() > 0.5
        ? `https://picsum.photos/300/${400 + Math.floor(Math.random() * 200)}`
        : "https://vjs.zencdn.net/v/oceans.mp4",
    cover: `https://picsum.photos/300/200?random=${i}`,
    poster: "https://via.placeholder.com/300x200",
    title: `内容标题 ${i + 1}`,
    description: "内容描述文字...",
    height: 200 + Math.floor(Math.random() * 100),
  }));
};

// 动态分配左右列数据
const leftColumnItems = computed(() => {
  return items.value.filter((_, index) => index % 2 === 0);
});

const rightColumnItems = computed(() => {
  return items.value.filter((_, index) => index % 2 === 1);
});

onMounted(() => {
  initData();
});
</script>

<style scoped>
.container {
  margin: 0 auto;
  padding: 20px;
  overflow-y: auto;
  height: 100vh;
  scroll-behavior: smooth;
  position: relative;
}

.refresh-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  transition: transform 0.3s ease;
}

.loading-indicator {
  text-align: center;
  padding: 20px;
  color: #666;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: spin 1s linear infinite;
}

/* 双列容器 */
.double-column-wrapper {
  display: flex;
  gap: 15px;
}

.column {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
}

/* 卡片样式 */
.card-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  transition: transform 0.2s;
}

.card-item:hover {
  transform: translateY(-3px);
}

.card-image {
  width: 100%;
  height: auto;
  display: block;
  background: #f5f5f5;
}

.card-content {
  padding: 12px;
}

.title {
  font-size: 14px;
  color: #333;
  margin: 0 0 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price {
  color: #ff4444;
  font-weight: bold;
  font-size: 16px;
  margin: 0;
}
.media-content {
  width: 100%;
  height: 50%;
  display: block;
  background: #f5f5f5;
}

/* 响应式适配 */
@media (max-width: 368px) {
  .double-column-wrapper {
    flex-direction: column;
  }

  .column {
    width: 100%;
  }
}
</style>
