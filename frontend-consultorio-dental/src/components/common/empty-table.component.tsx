interface Props {
  mensaje?: string
  colSpan?: number
  submensaje?: string
}

export default function EmptyTable({ mensaje, submensaje, colSpan = 7 }: Props) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="empty-state">

          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#f5f5f4" />
            <circle cx="24" cy="20" r="6" stroke="#9ca3af" strokeWidth="1.5" />
            <path d="M12 36c0-6.627 5.373-10 12-10s12 3.373 12 10" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="29" y1="29" x2="36" y2="36" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            <line x1="29" y1="36" x2="36" y2="29" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </svg>

          <p className="empty-title">{ mensaje }</p>
          <p className="empty-desc">{ submensaje }</p>

        </div>
      </td>
    </tr>
  )
}