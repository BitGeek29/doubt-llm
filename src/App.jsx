import React, { useState } from 'react';
import ChemChatWindow from './components/ChemChatWindow';
import BioChatWindow from './components/BioChatWindow';
import PhyChatWindow from './components/PhyChatWindow';
import MathChatWindow from './components/MathChatWindow';

function App() {
    const [currentWindow, setCurrentWindow] = useState("choose-subject");


    return (
        <>
            {currentWindow === "choose-subject" && (<div className="w-full h-screen bg-[#262626] m-0 p-8">
                <div className="block rounded-lg shadow-xs max-w-screen-xl text-center mx-auto p-8 bg-[#2b2b2b]">
                    <div className="mt-2">
                        <div className="font-bold text-5xl text-white">
                            Choose Your Subject To Get Started
                        </div>

                        <div className="mt-6 flex justify-center items-center gap-8 text-xs">
                            <div className="sm:inline-flex sm:shrink-0 sm:items-center sm:gap-2 rounded-lg p-8 shadow-xs shadow-indigo-100 bg-[#addfba]">

                                <div onClick={() => setCurrentWindow("bio-chat")} className="mt-1.5 sm:mt-0 text-left">
                                    <p className="text-gray-500 font-bold text-3xl text-indigo-700">Biology</p>

                                    <p className="font-medium text-xl">Explore life sciences and human anatomy</p>
                                </div>
                            </div>

                            <div onClick={() => setCurrentWindow("chem-chat")} className="sm:inline-flex sm:shrink-0 sm:items-center sm:gap-2 rounded-lg p-8 shadow-xs shadow-indigo-100 bg-[#b9d8ec]">

                                <div className="mt-1.5 sm:mt-0 text-left">
                                    <p className="text-gray-500 font-bold text-3xl text-indigo-700">Chemistry</p>

                                    <p className="font-medium text-xl">Master the chemical reactions and components</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center items-center gap-8 text-xs">

                            <div onClick={() => setCurrentWindow("math-chat")} className="sm:inline-flex sm:shrink-0 sm:items-center sm:gap-2 rounded-lg p-8 shadow-xs shadow-indigo-100 bg-[#b9d8ec]">

                                <div className="mt-1.5 sm:mt-0 text-left">
                                    <p className="text-gray-500 font-bold text-3xl text-indigo-700">Mathematics</p>

                                    <p className="font-medium text-xl">Solve problems and discover mathematical wonders</p>
                                </div>
                            </div>

                            <div onClick={() => setCurrentWindow("phy-chat")} className="sm:inline-flex sm:shrink-0 sm:items-center sm:gap-2 rounded-lg p-8 shadow-xs shadow-indigo-100 bg-[#b9d8ec]">

                                <div className="mt-1.5 sm:mt-0 text-left">
                                    <p className="text-gray-500 font-bold text-3xl text-indigo-700">Physics</p>

                                    <p className="font-medium text-xl">Explore the laws of motion and the universe</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>)}
            {currentWindow === "chem-chat" && (
                <ChemChatWindow setCurrentWindow={setCurrentWindow} />
            )}
            {currentWindow === "bio-chat" && (
                <BioChatWindow setCurrentWindow={setCurrentWindow} />
            )}
            {currentWindow === "phy-chat" && (
                <PhyChatWindow setCurrentWindow={setCurrentWindow} />
            )}
            {currentWindow === "math-chat" && (
                <MathChatWindow setCurrentWindow={setCurrentWindow} />
            )}

        </>
    )
}

export default App
