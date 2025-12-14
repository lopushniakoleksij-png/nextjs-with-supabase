"use client"

type Props = {
  loading: boolean
  text: string
  loadingText?: string
}

export function AuthSubmitButton({
  loading,
  text,
  loadingText = "Please wait...",
}: Props) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-black text-white py-2 rounded
                 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? loadingText : text}
    </button>
  )
}

