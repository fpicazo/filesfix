import axios from 'axios'
import http from '../config/http'

const uploadFileToS3 = async ({ file, module, recordId, tenantId, tipo }) => {
  try {
    if (!recordId || !file?.name) {
      throw new Error('Missing recordId or file.name')
    }

    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExtension}`

    // Step 1: Get presigned URL
    const { data } = await http.post('/api/images', {
      module,
      recordId,
      fileName,
      contentype: file.type,
    })

    const { url, fileUrl } = data
    console.log('Presigned URL data:', data)

    // Step 2: Upload to S3
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    })
    console.log('File uploaded to S3')

    // Step 3: Save metadata
    if( tipo !== "profile" ) {
    const moduleIdKey = `${module.slice(0, -1)}Id` 
    await http.post('/api/attachments', {
      url: fileUrl,
      module,
      recordId,
      name: file.name,
      size: file.size,
      type: file.type,
      id_reference: recordId,
      [moduleIdKey]: recordId,
    })
    }

    console.log('Metadata saved to backend')
    return fileUrl

  } catch (error) {
    console.error('Error during upload:', error)
    throw error
  }
}

export default uploadFileToS3
