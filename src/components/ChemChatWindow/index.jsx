import React, { useRef, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import MarkdownPreviewer from '../MarkdownPreviewer';

export default function ChemChatWindow({ setCurrentWindow }) {
    const [inputValue, setInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [image, setImage] = useState(null);
    const [promptResponses, setPromptResponses] = useState([]);
    const [loading, setLoading] = useState(false);
    const hiddenFileInput = useRef(null);

    const genAI = new GoogleGenerativeAI(
        import.meta.env.VITE_GEMINI_API_KEY
        // add your api key here
    );
    const handleInputChange = (e) => setInputValue(e.target.value);

    const handleAddImageClick = () => {
        hiddenFileInput.current.click();
    };

    const handleImageChange = (e) => {
        if (e.target.files.length > 0) {
            setSelectedImage(e.target.files[0]);
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);

        }
    };

    // Remove the current image preview
    const handleRemoveImage = () => {
        setImage(null);
    };

    const getResponseForGivenPrompt = async () => {
        try {
            setLoading(true);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: {
                    temperature: 1,
                    top_p: 0.95,
                    top_k: 40,
                    max_output_tokens: 8192,
                    // response_mime_type: "text/markdown",
                },
                        systemInstruction: `
                    You are a tutor specializing in NCERT Chemistry for Class 11 and 12.
                    Help students understand complex topics, solve doubts, and guide them through problem-solving.

                    1. Solved solution with proper steps.
                    2. Topic or solution related video or source links. 
                    3. Solution refered book and it page number as per the given solution.

                    Response Format:-
                    1.Question: Clearly restate or display the given question.  
                    2.Detailed Explanation: Step-by-step solution with proper derivations and reasoning. 
                    3.Answer: Provide the final answer in bold.  
                    4.Explanations for Incorrect Options: If applicable, explain why other choices are incorrect.  
                    5.Key Points to Remember: Summarize important formulas and concepts.  
                    6.Related NEET Topics: List relevant topics related to the question.  
                    7.References: Mention NCERT book chapters and pages, along with relevant YouTube video links.  
                  `,

            });

            // Build the prompt parts (text and optionally image)
            let parts = [{ text: inputValue }];

            if (selectedImage) {
                const base64Image = await toBase64(selectedImage);
                parts.push({
                    inline_data: {
                        mime_type: selectedImage.type,
                        data: base64Image
                    }
                });
            }
            console.log({
                contents: [{ role: "user", parts }]
            })
            const result = await model.generateContent({
                contents: [{ role: "user", parts }]
            });

            const responseText = result.response.text();
            console.log(responseText);
            setPromptResponses([responseText]);
            // setInputValue('');
            // setSelectedImage(null);
            setLoading(false);
        } catch (error) {
            console.error("Something went wrong:", error);
            setLoading(false);
        }
    };

    // Helper function to convert file to Base64
    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]); // Remove prefix
            reader.onerror = (error) => reject(error);
        });

    return (
        <>
            <div className="w-full h-screen bg-[#262626] m-0 p-8">
                <div className="block rounded-lg shadow-xs max-w-screen-xl text-center mx-auto my-5 p-8 bg-[#2b2b2b]">

                    <div className="flex justify-between">
                        <div className="flex items-center mt-4">
                            <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                                <span className="font-medium text-gray-600 dark:text-gray-300">C</span>
                            </div>
                            <div className="mx-2 text-2xl text-white uppercase font-bold">
                                Chemistry
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={() => setCurrentWindow("choose-subject")}
                                className="group mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-black transition focus:ring-3 focus:ring-blue-400 focus:outline-hidden sm:mt-0 sm:w-auto"
                            >
                                <span className="text-sm font-medium"> Change Subject </span>

                            </button>
                        </div>
                    </div>

                    <div className="my-4 flex flex-col w-full items-start justify-start">
                        {image && (
                            <div className="relative inline-block p-2 my-2">
                                <img
                                    alt="Uploaded preview"
                                    src={image}
                                    className="size-16 rounded-lg object-cover shadow-xs"
                                />
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute top-0 right-0 rounded-full bg-gray-500 p-0.5 text-white"
                                >
                                    <span className="sr-only">Remove badge</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="size-3"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {!image && (<div className="my-6">
                            <button
                                type="button"
                                onClick={handleAddImageClick}
                                className="group mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-black transition focus:ring-3 focus:ring-blue-400 focus:outline-hidden sm:mt-0 sm:w-auto"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-6" viewBox="0 -960 960 960" fill="undefined"><path d="M480-480ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h320v80H200v560h560v-320h80v320q0 33-23.5 56.5T760-120H200Zm40-160h480L570-480 450-320l-90-120-120 160Zm440-320v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z" /></svg>
                                <span className="text-sm font-medium"> Add Image </span>
                            </button>
                            {/* Hidden file input triggered by the Add Image button */}
                            <input
                                type="file"
                                accept="image/*"
                                ref={hiddenFileInput}
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                        )}
                    </div>



                    <div>
                        <div className="sm:flex sm:gap-4">
                            <div className="sm:flex-1">
                                <label htmlFor="prompt-box" className="sr-only">Prompt here</label>

                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    placeholder="Ask Me Your Doubts"
                                    className="w-full rounded-md border-gray-200 bg-[#262626] p-3 text-white shadow-xs transition focus:border-white focus:ring-3 focus:ring-blue-400 focus:outline-hidden"
                                />
                            </div>

                            <button
                                onClick={getResponseForGivenPrompt}
                                className="mt-4 flex w-full items-center justify-center rounded-md bg-blue-400 px-5 py-1 text-black transition focus:ring-3 focus:ring-blue-400 focus:outline-hidden sm:mt-0 sm:w-auto"
                            >
                                <svg className="size-8 text-black" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M10 0C15.5228 0 20 4.47703 20 9.99972C20 15.5224 15.5228 19.9994 10 19.9994C8.40848 19.9994 6.86989 19.6268 5.48336 18.9236L5.3325 18.8432L0.776363 19.9808C0.389086 20.0775 0.0327801 19.7955 0.00163734 19.4292L0.00142664 19.3275L0.0186661 19.2229L1.15625 14.6683L1.07711 14.5187C0.508253 13.3978 0.155414 12.1774 0.0409332 10.91L0.00921994 10.4326L0 9.99972C0 4.47703 4.47715 0 10 0ZM10 1.24996C5.16751 1.24996 1.25 5.16736 1.25 9.99972C1.25 11.521 1.63818 12.9844 2.36691 14.2807C2.42558 14.385 2.45263 14.5033 2.44615 14.6212L2.42842 14.7385L1.48375 18.5145L5.2638 17.5724C5.34117 17.5531 5.42077 17.549 5.49841 17.5594L5.61288 17.5859L5.72126 17.6339C7.01702 18.3618 8.47963 18.7495 10 18.7495C14.8325 18.7495 18.75 14.8321 18.75 9.99972C18.75 5.16736 14.8325 1.24996 10 1.24996ZM10.625 11.2497C10.9702 11.2497 11.25 11.5295 11.25 11.8747C11.25 12.1815 11.0289 12.4367 10.7373 12.4896L10.625 12.4996H6.875C6.52982 12.4996 6.25 12.2198 6.25 11.8747C6.25 11.5678 6.47109 11.3127 6.76266 11.2598L6.875 11.2497H10.625ZM13.125 7.49979C13.4702 7.49979 13.75 7.7796 13.75 8.12477C13.75 8.43159 13.5289 8.68677 13.2373 8.73968L13.125 8.74975H6.875C6.52982 8.74975 6.25 8.46994 6.25 8.12477C6.25 7.81795 6.47109 7.56278 6.76266 7.50986L6.875 7.49979H13.125Z" fill="#ffff" />
                                </svg>
                            </button>
                        </div>
                    </div>

                </div>

                <div className="block rounded-lg shadow-xs max-w-screen-xl mx-auto my-5 p-8 bg-[#2b2b2b]">
                    <div className="container">
                        <div className="mt-3">
                            {loading ? (
                                <div className="space-y-2">
                                    <div class="flex items-center justify-start my-4">
                                        <svg class="w-8 h-8 text-gray-200 dark:text-gray-700 me-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                                        </svg>
                                        <div>
                                            <div class="w-20 h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 me-3 my-0.5"></div>
                                            <div class="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700 my-0.5"></div>
                                        </div>
                                    </div>
                                    <div role="status" className="space-y-2.5 animate-pulse max-w-lg">
                                        <div className="flex items-center w-full">
                                            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32"></div>
                                            <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
                                            <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
                                        </div>
                                        <div className="flex items-center w-full max-w-[480px]">
                                            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
                                            <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
                                            <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
                                        </div>
                                        <div className="flex items-center w-full max-w-[400px]">
                                            <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
                                            <div className="h-2.5 ms-2 bg-gray-200 rounded-full dark:bg-gray-700 w-80"></div>
                                            <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
                                        </div>
                                        <span className="sr-only">Loading...</span>
                                    </div>

                                </div>
                            ) : (
                                promptResponses.map((promptResponse, index) => (
                                    <>
                                        <div className="flex items-center my-4">
                                            <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                                                <span className="font-medium text-gray-600 dark:text-gray-300">AI</span>
                                            </div>
                                            <div className="mx-2 text-xl text-white font-bold">
                                                Chemistry Helper
                                            </div>
                                        </div>
                                        <div key={index} className="my-2">
                                            <MarkdownPreviewer content={promptResponse} />
                                        </div>
                                    </>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div >
        </>
    )
}
