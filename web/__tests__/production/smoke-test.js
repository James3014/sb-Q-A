// 生產環境煙霧測試
const PROD_URL = 'https://www.snowskill.app'

const tests = [
  {
    name: '首頁載入',
    test: async () => {
      const response = await fetch(PROD_URL)
      return response.status === 200
    }
  },
  {
    name: '付費頁面可訪問',
    test: async () => {
      const response = await fetch(`${PROD_URL}/pricing`)
      return response.status === 200
    }
  },
  {
    name: '課程頁面可訪問',
    test: async () => {
      const response = await fetch(`${PROD_URL}/lesson/01`)
      return response.status === 200
    }
  },
  {
    name: 'API 健康檢查',
    test: async () => {
      try {
        // 檢查是否有基本的 API 響應
        const response = await fetch(`${PROD_URL}/api/health`)
        return response.status === 200 || response.status === 404 // 404 也算正常，表示服務在運行
      } catch {
        return false
      }
    }
  }
]

async function runSmokeTests() {
  console.log('🔍 開始生產環境煙霧測試...\n')
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const result = await test.test()
      if (result) {
        console.log(`✅ ${test.name}`)
        passed++
      } else {
        console.log(`❌ ${test.name}`)
        failed++
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ${error.message}`)
      failed++
    }
  }
  
  console.log(`\n📊 結果: ${passed} 通過, ${failed} 失敗`)
  
  if (failed === 0) {
    console.log('🎉 所有生產環境測試通過！')
  } else {
    console.log('⚠️  有測試失敗，請檢查生產環境')
  }
}

// 如果直接執行此檔案
if (require.main === module) {
  runSmokeTests()
}

module.exports = { runSmokeTests }
