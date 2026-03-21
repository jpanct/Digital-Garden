import client from './client'

export const notesApi = {
  getNotes: (planId: number, moduleId: string, userId: number) =>
    client.get(`/plans/${planId}/modules/${moduleId}/notes`, { params: { user_id: userId } }),
  createNote: (planId: number, moduleId: string, userId: number, contentHtml: string, contentText: string) =>
    client.post(`/plans/${planId}/modules/${moduleId}/notes`, {
      user_id: userId,
      content_html: contentHtml,
      content_text: contentText,
    }),
  updateNote: (noteId: number, contentHtml: string, contentText: string) =>
    client.put(`/notes/${noteId}`, { content_html: contentHtml, content_text: contentText }),
  deleteNote: (noteId: number) =>
    client.delete(`/notes/${noteId}`),
}
