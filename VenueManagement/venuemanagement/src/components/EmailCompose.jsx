// Install: npm install react-quill-new

import React, { useState, useRef, useEffect } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import http from '../config/http'
import { X, ExternalLink, Paperclip, Smile, Paperclip as AttachIcon, HelpCircle, Trash2, ChevronDown } from 'lucide-react'

export default function EmailPopupCompose() {
  const [email, setEmail] = useState({
    from: 'antoine@unmake.io',
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    message: '',
  })

  const checkEmailStatus = () => {
    http.get('/api/gmailintegration/gmail/status')
      .then(response => {
        setEmail(prev => ({
          ...prev,
          from: response.data.email || prev.from
        }))
        const connected = response.data.connected
        if (!connected) {
          alert('Gmail is not connected. Please connect your Gmail account to send emails.')
          return
        }
        console.log('Email status:', response.data);
      })
      .catch(error => {
        console.error('Error checking email status:', error);
      });
  }

  useEffect(() => {
    checkEmailStatus();
  }, []);

  const [visible, setVisible] = useState(true)
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [attachments, setAttachments] = useState([])
  
  const fileInputRef = useRef(null)
  const quillRef = useRef(null)

  // Simple emoji set
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙']

  // React-Quill configuration - Gmail-like toolbar
  const quillModules = {
    toolbar: [
      [{ 'font': ['sans-serif', 'serif', 'monospace'] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'code-block'],
      [{ 'align': [] }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  }

  const quillFormats = [
    'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'link', 'image', 'code-block',
    'align'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setEmail((prev) => ({ ...prev, [name]: value }))
  }

  const handleMessageChange = (content, delta, source, editor) => {
    setEmail(prev => ({ 
      ...prev, 
      message: content,
      // Store both HTML and plain text
      messageText: editor.getText()
    }))
  }

 const handleSend = async () => {
  if (!email.to.trim()) {
    alert('Please enter a recipient email address');
    return;
  }

  const htmlContent = email.message;
  const plainTextContent = quillRef.current?.getEditor().getText() || '';
  const wordCount = plainTextContent.split(' ').filter(word => word.length > 0).length;

  try {
   

    const res = await http.post('/api/gmailintegration/gmail/send', {
      to: email.to,
      from: email.from,
      subject: email.subject || '(No Subject)',
      message: plainTextContent,
      html: htmlContent,
    });

    console.log('Email sent:', res.data);
    alert('Email sent successfully!');
    setVisible(false);
  } catch (error) {
    console.error('Failed to send email:', error);
    alert('Failed to send email. Please check the console for details.');
  }
};
  // Insert emoji into Quill editor
  const insertEmoji = (emoji) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor()
      const range = editor.getSelection(true)
      editor.insertText(range.index, emoji)
      editor.setSelection(range.index + emoji.length)
    }
    setShowEmojiPicker(false)
  }

  // Insert template into Quill editor
  const insertTemplate = (template) => {
    const templates = {
      greeting: "Hi [Name],<br><br>I hope this email finds you well.<br><br>",
      followUp: "Following up on our previous conversation...<br><br>",
      meeting: "I'd like to schedule a meeting to discuss...<br><br>",
      thanks: "Thank you for your time and consideration.<br><br>Best regards,<br>",
      signature: "<br>—<br><strong>Antoine Milkoff</strong><br><small>Sent from Front</small>"
    }
    
    if (quillRef.current) {
      const editor = quillRef.current.getEditor()
      const range = editor.getSelection(true)
      editor.clipboard.dangerouslyPasteHTML(range.index, templates[template] || template)
    }
  }

  // Handle file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => file.size <= 25 * 1024 * 1024) // 25MB limit
    
    if (files.length !== validFiles.length) {
      alert('Some files were too large (max 25MB per file)')
    }
    
    setAttachments(prev => [...prev, ...validFiles])
    e.target.value = '' // Reset input
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const deleteDraft = () => {
    if (window.confirm('Delete draft? This action cannot be undone.')) {
      setVisible(false)
    }
  }

  const shareDraft = () => {
    const plainText = quillRef.current?.getEditor().getText() || ''
    const shareText = `Subject: ${email.subject}\n\n${plainText}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Email Draft',
        text: shareText,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Draft copied to clipboard!')
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 w-[650px] max-w-full shadow-2xl border border-gray-300 rounded-lg bg-white flex flex-col text-sm z-50 max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white rounded-t-lg flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-900">Personal draft</span>
            <span className="text-xs text-gray-500">Only visible to you</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={shareDraft}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            title="Share or copy draft"
          >
            SHARE DRAFT
            <ExternalLink className="w-3 h-3" />
          </button>
          <button 
            onClick={() => setVisible(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Email Form */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* From Field */}
        <div className="flex items-center px-4 py-2 border-b border-gray-100 flex-shrink-0">
          <label className="text-gray-600 w-12 text-right mr-3">From:</label>
          <input
            type="email"
            name="from"
            value={email.from}
            onChange={handleChange}
            className="flex-1 bg-transparent text-gray-900 focus:outline-none text-sm"
            readOnly
          />
        </div>

        {/* To Field */}
        <div className="flex items-center px-4 py-2 border-b border-gray-100 flex-shrink-0">
          <label className="text-gray-600 w-12 text-right mr-3">To:</label>
          <input
            type="email"
            name="to"
            value={email.to}
            onChange={handleChange}
            placeholder="Recipients"
            className="flex-1 bg-transparent text-gray-900 focus:outline-none text-sm placeholder-gray-400"
          />
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <button 
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="hover:text-gray-700 transition-colors"
            >
              Cc
            </button>
            <button 
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="hover:text-gray-700 transition-colors"
            >
              Bcc
            </button>
          </div>
        </div>

        {/* CC/BCC Fields */}
        {showCcBcc && (
          <>
            <div className="flex items-center px-4 py-2 border-b border-gray-100 flex-shrink-0">
              <label className="text-gray-600 w-12 text-right mr-3">Cc:</label>
              <input
                type="email"
                name="cc"
                value={email.cc}
                onChange={handleChange}
                placeholder="Carbon copy recipients"
                className="flex-1 bg-transparent text-gray-900 focus:outline-none text-sm placeholder-gray-400"
              />
            </div>
            <div className="flex items-center px-4 py-2 border-b border-gray-100 flex-shrink-0">
              <label className="text-gray-600 w-12 text-right mr-3">Bcc:</label>
              <input
                type="email"
                name="bcc"
                value={email.bcc}
                onChange={handleChange}
                placeholder="Blind carbon copy recipients"
                className="flex-1 bg-transparent text-gray-900 focus:outline-none text-sm placeholder-gray-400"
              />
            </div>
          </>
        )}

        {/* Subject Field */}
        <div className="flex items-center px-4 py-2 border-b border-gray-100 flex-shrink-0">
          <label className="text-gray-600 w-12 text-right mr-3">Subject:</label>
          <input
            type="text"
            name="subject"
            value={email.subject}
            onChange={handleChange}
            placeholder="Subject"
            className="flex-1 bg-transparent text-gray-900 focus:outline-none text-sm placeholder-gray-400"
          />
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
            <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded text-xs max-w-64">
                  <Paperclip className="w-3 h-3 flex-shrink-0 text-blue-600" />
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="text-gray-500 flex-shrink-0">({formatFileSize(file.size)})</span>
                  <button 
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0 transition-colors"
                    title="Remove attachment"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rich Text Editor */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 p-4">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={email.message}
              onChange={handleMessageChange}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Type your message..."
              style={{
                height: '200px',
                display: 'flex',
                flexDirection: 'column'
              }}
            />
            
            {/* Templates */}
            <div className="mt-16 p-3 bg-gray-50 rounded-lg">
              <div className="font-medium mb-2 text-gray-700">Quick templates:</div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => insertTemplate('greeting')} 
                  className="text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded-md text-xs font-medium border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  Greeting
                </button>
                <button 
                  onClick={() => insertTemplate('followUp')} 
                  className="text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded-md text-xs font-medium border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  Follow-up
                </button>
                <button 
                  onClick={() => insertTemplate('meeting')} 
                  className="text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded-md text-xs font-medium border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  Meeting
                </button>
                <button 
                  onClick={() => insertTemplate('thanks')} 
                  className="text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded-md text-xs font-medium border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  Thanks
                </button>
                <button 
                  onClick={() => insertTemplate('signature')} 
                  className="text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded-md text-xs font-medium border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white rounded-b-lg flex-shrink-0">
        {/* Left side icons */}
        <div className="flex items-center gap-1">
          {/* Emoji Picker */}
          <div className="relative">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
              title="Insert emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 bg-white border border-gray-300 rounded-lg shadow-xl p-3 z-50">
                <div className="grid grid-cols-5 gap-1 max-h-32 overflow-y-auto">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => insertEmoji(emoji)}
                      className="text-lg hover:bg-gray-100 rounded p-1 transition-colors"
                      title={`Insert ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Attach Files */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
            title="Attach files"
          >
            <AttachIcon className="w-4 h-4" />
          </button>
          
          {/* Help */}
          <div className="relative">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
              title="Keyboard shortcuts"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            
            {showHelp && (
              <div className="absolute bottom-12 left-0 bg-white border border-gray-300 rounded-lg shadow-xl p-3 z-50 w-64">
                <div className="text-xs space-y-1">
                  <div className="font-medium mb-2 text-gray-900">Keyboard shortcuts:</div>
                  <div>Ctrl+B - Bold</div>
                  <div>Ctrl+I - Italic</div>
                  <div>Ctrl+U - Underline</div>
                  <div>Ctrl+K - Insert link</div>
                  <div>Ctrl+Enter - Send email</div>
                  <div>Ctrl+Z - Undo</div>
                  <div>Ctrl+Y - Redo</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Delete Draft */}
          <button 
            onClick={deleteDraft}
            className="p-2 hover:bg-gray-100 rounded-md text-red-600 transition-colors"
            title="Delete draft"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Word Count */}
          {email.messageText && (
            <div className="text-xs text-gray-500 ml-2">
              {email.messageText.split(' ').filter(word => word.length > 0).length} words
            </div>
          )}
        </div>

        {/* Right side - Send button */}
        <div className="flex items-center gap-2">
          {/* Draft saved indicator */}
          <div className="text-xs text-gray-500">
            Draft saved
          </div>
          
          <button
            onClick={handleSend}
            className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
            title="Send email"
          >
            Send & Archive
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept="*/*"
      />

      {/* Custom styles for Quill editor */}
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 12px;
          background: #f9fafb;
        }
        
        .ql-container.ql-snow {
          border: none;
          font-size: 14px;
          flex: 1;
        }
        
        .ql-editor {
          min-height: 150px;
          padding: 12px 16px;
          line-height: 1.5;
        }
        
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        
        .ql-toolbar .ql-formats {
          margin-right: 8px;
        }
        
        .ql-toolbar button {
          margin: 0 1px;
        }
        
        .ql-toolbar button:hover {
          color: #1a73e8;
        }
        
        .ql-toolbar .ql-active {
          color: #1a73e8;
        }
      `}</style>
    </div>
  )
}