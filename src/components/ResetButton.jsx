import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { ConfirmDelete } from './EditModal';

export default function ResetButton() {
  const { resetAll } = useAppData();
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <button
        className="reset-btn"
        onClick={() => setConfirm(true)}
        title="重設所有資料至預設值"
      >
        🔄
      </button>
      <ConfirmDelete
        open={confirm}
        title="重設所有資料"
        message="這將把所有客製化內容恢復為預設值。你自行新增、修改的內容將會遺失。確定要重設嗎？"
        onConfirm={() => { setConfirm(false); resetAll(); }}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
