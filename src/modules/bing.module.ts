import { Common } from '../common.ts'

import type { RouterMiddleware } from '@oak/oak'

// The data structure we want to provide remains the same
interface BingItem {
  title: string
  headline: string
  description: string
  cover: string
  main_text: string
  copyright: string
  update_date: string
}

class ServiceBing {
  #cache = new Map<string, BingItem>()

  handle(): RouterMiddleware<'/bing'> {
    return async (ctx) => {
      const data = await this.#fetch()

      if (!data) {
        ctx.response.status = 500
        ctx.response.body = Common.buildJson(null, 500, '获取数据失败')
        return
      }

      switch (ctx.state.encoding) {
        case 'text':
          ctx.response.body = data.cover || ''
          break

        case 'image':
          ctx.response.redirect(data.cover || '')
          break

        case 'json':
        default:
          ctx.response.body = Common.buildJson(data)
          break
      }
    }
  }

  async #fetch() {
    const dailyUniqueKey = Common.localeDate()
    const cache = this.#cache.get(dailyUniqueKey)

    if (cache) {
      return cache
    }

    const api = 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'

    try {
      const res = await fetch(api)
      if (!res.ok) {
        // Log the error and return null if the fetch fails
        console.error(`Bing API request failed with status: ${res.status}`)
        return null
      }

      const bingData = await res.json()

      if (bingData?.images?.length) {
        const image = bingData.images[0]
        const today = Common.localeDate()

        const data: BingItem = {
          title: image.title,
          headline: image.headline || image.title, // Use title as a fallback for headline
          description: image.copyright, // The API provides the best description in the copyright field
          main_text: '', // This specific field is not available in the API response
          cover: `https://www.bing.com${image.urlbase}_1920x1080.jpg`,
          copyright: image.copyright,
          update_date: today,
        }

        // Save to cache for subsequent requests today
        this.#cache.set(today, data)

        return data
      }
      return null
    } catch (error) {
        console.error('Error fetching or parsing Bing data:', error)
        return null
    }
  }
}

export const serviceBing = new ServiceBing()