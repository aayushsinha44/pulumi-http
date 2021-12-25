import { useState } from "react"
import axios from "axios"
import { ExclamationIcon } from '@heroicons/react/solid'


export default function AWS(props) {

  const [isLoading, setLoading] = useState(false)

  const [content, setContent] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [accessSecret, setAccessSecret] = useState('')

  const [websiteData, setWebSiteData] = useState([])
  
  
  const deployWebsite = () => {
    if(isLoading) {
      return
    }

    const payload = {
      content: content
    }

    const header = {
      headers: {
        access_key: accessKey,
        access_secret: accessSecret
      }
    }

    setLoading(true)

    axios.post("http://localhost:5000/aws/sites", payload, header).then(res => {
      const data = res.data
      websiteData.push(data)
      setWebSiteData(websiteData)
      setLoading(false)
    }).catch(e => {
      setLoading(false)
      if(e && e.response && e.response.data && e.response.data.message)
        alert(e.response.data.message)
      else
        alert('Something went wrong. Please check your access keys and try again.')
    })
  }

  const deleteWebsite = (event) => {
    const id = event.target.value
    if(isLoading) {
      return
    }

    const payload = {
    }

    const header = {
      headers: {
        access_key: accessKey,
        access_secret: accessSecret
      }
    }

    let websiteIdx = -1
    for(let idx in websiteData) {
      if(websiteData[idx].id == id) {
        websiteIdx = idx
        break
      }
    }

    if(websiteIdx == -1) {
      return
    }

    setLoading(true)

    axios.delete("http://localhost:5000/aws/sites/"+id, header).then(res => {
      websiteData.splice(websiteIdx, 1)
      setWebSiteData(websiteData)
      setLoading(false)
    }).catch(e => {
      setLoading(false)
      if(e && e.response && e.response.data && e.response.data.message)
        alert(e.response.data.message)
      else
        alert('Something went wrong. Please check your access keys and try again.')
    })
  }

  const createExistingWebsiteData = () => {
    let retUI = []
    
    websiteData.forEach(item => {
      retUI.push(
        <div className="p-8">
          Website URL: <span className="underline cursor-pointer decoration-indigo-500"
          onClick={() => {window.open("http://"+item.website_url, '_blank').focus();}}>http://{item.website_url}</span>
          <button
            type="button"
            disabled={isLoading}
            onClick={deleteWebsite}
            value={item.id}
            className="ml-4 disabled:opacity-50 mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      )
    });

    return retUI

  }


  return (
    <div>
      <div className="flex mt-8">
        <div className="pr-8 pl-8">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            AWS Access Key
          </label>
          <div className="mt-1">
            <input
              value={accessKey}
              onChange={(event) => setAccessKey(event.target.value) }
              type="text"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            AWS Secret Key
          </label>
          <div className="mt-1">
            <input
              value={accessSecret}
              onChange={(event) => setAccessSecret(event.target.value) }
              type="text"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="pl-8 pt-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Website Content
        </label>
        <div className="mt-1">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={4}
            name="comment"
            id="comment"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            defaultValue={''}
          />
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={deployWebsite}
          className=" disabled:opacity-50 mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Deploy
        </button>
      </div>

      {isLoading && <div className="rounded-md bg-yellow-50 p-8 mt-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Deploy in progress...</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Please wait the deploy in progess. It takes around 30 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>}
      <div>
      {createExistingWebsiteData()}
      </div>
    </div>
  )
}