import './global.css';
import StartHere from 'components/pages/intro/StartHere/StartHere';
import { useNavigatorContext } from 'expo-router/build/views/Navigator';

export default function App() {
  return (
    <>
      <StartHere />
    </>
  );
}
