export interface MobiMessage {

    id: string

    role: 'user' | 'assistant'

    text: string

    createdAt: Date

}
export interface ChatRequest {
  messages: MobiMessage[]
}

export interface ChatResponse {
  text: string
}