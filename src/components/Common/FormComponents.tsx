// Este arquivo exporta todos os componentes de formulário em um único lugar
import FormErrorMessage from './FormErrorMessage';
import FormHelperText from './FormHelperText';
import FormLabel from './FormLabel';
import FormControl from './FormControl';

// Exportações nomeadas para uso com destructuring
export {
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  FormControl
};

// Exportação default como objeto para uso com namespace
const FormComponents = {
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  FormControl
};

export default FormComponents;
