import { faker } from '@faker-js/faker'

export const mockFetchData = async ({ page = 1, type = 'mixed', format }) => {
  // 根据参数生成不同数据
  const count = 10
  const seed = page * 1000
  faker.seed(seed)

  return Array.from({ length: count }, (_, i) => {
    const isVideo = type === 'video' || (type === 'mixed' && Math.random() > 0.6)
    
    return {
      id: `${page}-${i}`,
      title: faker.lorem.sentence(),
      type: isVideo ? 'video' : 'image',
      url: isVideo 
        ? 'https://vjs.zencdn.net/v/oceans.mp4' // 替换为实际视频URL
        : `https://picsum.photos/300/${400 + Math.floor(Math.random() * 200)}`,
      cover: `https://picsum.photos/300/200?random=${seed + i}`,
      height: 300 + Math.floor(Math.random() * 200)
    }
  })
}
