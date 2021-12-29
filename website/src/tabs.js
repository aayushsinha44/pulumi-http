import { useState } from "react"
import AWS from "./aws"
import GCP from "./gcp"

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Tabs(props) {
  const tabs = [
    { name: 'AWS', href: '#' },
    { name: 'GCP', href: '#' },
  ]

  const formId = props.formId

  const [currentTab, setCurrentTab] = useState(tabs[0].name)
  

  const tabChanged = (event) => {
    event.preventDefault()
    setCurrentTab(event.target.getAttribute('name'))
  }

  const tabUI = () => {
    if(currentTab === tabs[0].name) {
      return (
        <div>
          <AWS />
        </div>
      )
    } else if(currentTab === tabs[1].name) {
      return (
        <div>
          <GCP />
        </div>
      )
    }
  }

  const tabOptionChanged = (event) => {
    setCurrentTab(event.target.value)
  }

  return (
    <div className="mb-8">
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          onChange={tabOptionChanged}
          value={currentTab}
          className="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={window.location.pathname + tab.href}
                name={tab.name}
                onClick={tabChanged}
                className={classNames(
                  (currentTab === tab.name)
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm'
                )}
                aria-current={(currentTab === tab.name) ? 'page' : undefined}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {tabUI()}
    </div>
  )
}