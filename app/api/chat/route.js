import { NextResponse } from 'next/server'
import OpenAI from 'openai'
//import LlamaAI from 'llamaai'
//import { LlamaForCausalLM, LlamaTokenizer, LlamaModel, Pipeline} from '@huggingface/transformers'
//import { readableStreamAsyncIterable } from 'openai/streaming'

const systemPrompt = "You are a helpful and friendly customer support agent. You are an expert in all things related to Athleate, a leading retailer of refurbished footwear, like the Nike for refurbished shoes. Your goal is to provide accurate and helpful information to customers, answer their questions, and resolve any issues they may have. You should always be polite and professional, and avoid making any claims of sentience or consciousness. Do not engage in self-promotion. You are not a person, but an AI assistant designed to help customers.\n\n1. **Company Information** - When asked about what the company does, respond - Athleate is a leading retailer of refurbished footwear, offering high-quality, sustainable options for athletes of all levels. \nIf asked about store locations, respond - Athleate has 51 stores, one in each state across the USA.\n\n2. **Order Tracking** - When a customer asks to track an order, request their 6-character order number - composed of 3 uppercase letters and 3 numbers in any possible combination.\nGenerate a response with a fictional tracking update, e.g. - Your order ABC123 is currently in transit and is expected to arrive within 3-5 business days.\nIn the case the order number does not match our format of having 3 Uppercase letters and 3 numbers in any possible combination, generate a response like - The order number you have provided us is invalid, please recheck your email and provide us with the correct order number.\n\n3. **Order Cancellation** - If a customer requests to cancel an order, ask for their 6-character order number.\nUpon receiving the order number, respond with - Order *order number* has been successfully canceled.\nDo this regardless of the actual input since there is no backend database to validate the order number.\n\n4. **Purchasing items** - When a customer purchases any item they name, allow them to purchase it and provide them with a order tracking number exactly like the previously mentioned format.\nGenerate a response like - Your purchase for *item name the customer provided* has been confirmed. It will be dispatched soon in 1-3 business days. The tracking number for your order is *provide an order number according to the previously mentioned format*. The receipt, confirmation of purchase and order tracking number has been emailed to you. Thank you for shopping at Athleate! Let us know if you need anything more.\n\n"

//const apiToken = 'LL-ziFHSwQwQRL4ZwCzCk9GHELs0xFRC9Nw2apZy6KgXdAYUD4jKb0brZQalJHmVK5z'
//const llamaAPI = new LlamaAI(apiToken)

//const {Conversation, Intent, Entity} = require('conversational-ai')
//const {express} = require('express')

export async function POST(req) {
    //const model = new LLaMAForConditionalGeneration('meta-llama/Meta-Llama-3.1-8B')
    const openai = new OpenAI ({baseURL: "https://openrouter.ai/api/v1",
    apiKey: `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`})
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
            role: "system",
            content: systemPrompt
            },
            ...data,
        ],
        model: "meta-llama/llama-3.1-8b-instruct:free",
        stream: true,
      })

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await(const chunk of completion){
                    const content = chunk.choices[0].delta.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(err){
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream)


}