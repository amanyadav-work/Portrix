import React from 'react'

const Loader = ({ text }) => {
    return (
        <div className="flex text-xs flex-col bg-black items-center w-full justify-center h-full  ">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
            <p className="mt-2 text-green-400">{text}</p>
        </div>
    )
}

export default Loader
