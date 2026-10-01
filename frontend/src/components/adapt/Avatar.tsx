"use client";
import { useRef } from 'react';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { fileToAvatarDataUri, getInitials } from '@/lib/profile-store';

type Props = {
  name: string;
  dataUri: string | null;
  size?: number;
  editable?: boolean;
  onChange?: (dataUri: string) => void;
  className?: string;
};

export default function Avatar({ name, dataUri, size = 92, editable = false, onChange, className = '' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Pick an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB.'); return; }
    try {
      const uri = await fileToAvatarDataUri(file);
      onChange?.(uri);
      toast.success('Avatar updated');
    } catch {
      toast.error('Couldn\'t read that image.');
    }
  };

  return (
    <div
      className={`ac-avatar ${editable ? 'editable' : ''} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.3 }}
      onClick={editable ? () => inputRef.current?.click() : undefined}
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
    >
      {dataUri ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUri} alt={`${name} avatar`} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
      {editable && (
        <>
          <div className="ac-avatar-overlay">
            <Camera size={size * 0.22} />
            <span>Change</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />
        </>
      )}
    </div>
  );
}
