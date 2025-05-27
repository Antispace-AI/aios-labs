/**
 * Enhanced parameter parsing logic extracted from main handler
 * Handles various parameter formats that can come from the AI request
 */

export function parseParameters(parameters: any): any {
  console.log("📝 Raw parameters:", parameters)
  
  let parsedParams = parameters
  const params = parameters as any
  
  console.log("🔍 Parameter parsing debug:")
  console.log("  - typeof parameters:", typeof parameters)
  console.log("  - Is array?", Array.isArray(parameters))
  console.log("  - Is string?", typeof parameters === 'string')
  console.log("  - Has length property?", params && typeof params.length === 'number')
  console.log("  - Length:", params?.length)
  console.log("  - First few chars:", typeof params === 'string' ? params.substring(0, 10) : "N/A")
  
  try {
    // Case 1: Parameters is a JSON string that represents an array
    if (typeof params === 'string' && params.startsWith('[')) {
      console.log("🔧 Parsing JSON string that looks like an array...")
      const arrayFromString = JSON.parse(params)
      console.log("✅ Parsed array from string:", arrayFromString)
      
      if (Array.isArray(arrayFromString) && arrayFromString.length > 0 && typeof arrayFromString[0] === 'string') {
        console.log("🔧 Parsing JSON string from array element...")
        parsedParams = JSON.parse(arrayFromString[0])
        console.log("✅ Final parsed parameters:", parsedParams)
      } else {
        console.log("⚠️ Array doesn't contain JSON string, using array as-is")
        parsedParams = arrayFromString
      }
    }
    // Case 2: Parameters is already an array-like object  
    else if (params && typeof params.length === 'number' && params.length > 0 && typeof params[0] === 'string') {
      console.log("🔧 Parsing JSON string from array-like object...")
      parsedParams = JSON.parse(params[0])
      console.log("✅ Parsed parameters from array element:", parsedParams)
    }
    // Case 3: Parameters is already a proper object
    else {
      console.log("⚠️ Parameters don't match expected formats, using as-is")
    }
  } catch (e) {
    console.warn("❌ Failed to parse parameters:", e)
    console.log("🔄 Falling back to original parameters")
    parsedParams = parameters
  }
  
  return parsedParams
} 