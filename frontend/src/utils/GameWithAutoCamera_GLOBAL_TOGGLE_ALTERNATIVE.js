/* ════════════════════════════════════════════════════════════════════
   ALTERNATIVE VERSION — global-toggle approach (not currently applied
   to GamifiedLearning.js, which uses the per-game button instead).

   If you ever want to switch: replace GameWithAutoCamera in
   GamifiedLearning.js with this version, and add:
     import { getCameraConsent } from "../utils/cameraConsent";
   near your other imports.

   Difference from the per-game-button version: no visible button at all
   inside any game. The camera silently starts (still fully hidden/
   invisible, same discreet red-dot indicator) IF AND ONLY IF the parent
   already turned the toggle on in Profile/Settings. If they haven't,
   nothing related to the camera renders or runs — zero permission
   prompts, zero indicators, completely invisible to the student.
   ════════════════════════════════════════════════════════════════════ */

function GameWithAutoCamera({children,onReaction,lang}){
  const[gameEnded,setGameEnded]=useState(false);
  const[scannerActive,setScannerActive]=useState(()=>getCameraConsent());
  const handleResult=useCallback((reaction)=>{onReaction&&onReaction(reaction);},[onReaction]);
  const handleClose=useCallback(()=>{setScannerActive(false);},[]);
  const signalGameEnd=useCallback(()=>{setGameEnded(true);},[]);
  const renderedChildren=typeof children==="function"?children({signalGameEnd}):children;
  return(<>{renderedChildren}{scannerActive&&(<FaceReactionScanner lang={lang} autoStart={true} gameEnded={gameEnded} onResult={handleResult} onClose={handleClose}/>)}</>);
}