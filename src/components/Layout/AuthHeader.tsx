import { useRef } from 'react';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Text,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink = ({ children, href }: NavLinkProps) => {
  const router = useRouter();
  const isActive = router.pathname === href;
  
  return (
    <Link
      as={NextLink}
      href={href}
      px={2}
      py={1}
      rounded="md"
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
      bg={isActive ? useColorModeValue('gray.200', 'gray.700') : 'transparent'}
      color={isActive ? 'blue.500' : 'inherit'}
      fontWeight={isActive ? 'medium' : 'normal'}
    >
      {children}
    </Link>
  );
};

export default function AuthHeader() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { session, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const userEmail = session.user?.email || '';
  const isAuthenticated = !!session.user;

  return (
    <Box bg={useColorModeValue('white', 'gray.900')} px={4} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Abrir Menu"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        
        <HStack spacing={8} alignItems="center">
          <Link
            as={NextLink}
            href="/"
            textDecoration="none"
            _hover={{ textDecoration: 'none' }}
          >
            <Text
              fontFamily="heading"
              fontWeight="bold"
              fontSize="xl"
              color="blue.500"
            >
              AgentVox
            </Text>
          </Link>
          
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/people">Pessoas</NavLink>
            <NavLink href="/sales">Vendas</NavLink>
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </HStack>
        </HStack>
        
        <Flex alignItems="center">
          {isAuthenticated ? (
            <Menu>
              <MenuButton
                ref={menuButtonRef}
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
                data-cy="user-menu"
              >
                <Avatar
                  size="sm"
                  name={userEmail.split('@')[0]}
                  bg="blue.500"
                  color="white"
                />
              </MenuButton>
              <MenuList zIndex={2}>
                <MenuItem as="div">
                  <Box>
                    <Text fontWeight="medium">{userEmail.split('@')[0]}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {userEmail}
                    </Text>
                  </Box>
                </MenuItem>
                <MenuDivider />
                <MenuItem as={NextLink} href="/profile">Perfil</MenuItem>
                <MenuItem as={NextLink} href="/settings">Configurações</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleSignOut} data-cy="logout-button">
                  Sair
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Stack
              flex={{ base: 1, md: 0 }}
              justify="flex-end"
              direction="row"
              spacing={6}
            >
              <Button 
                as={NextLink} 
                href="/auth/login" 
                fontSize="sm" 
                fontWeight={400} 
                variant="link"
              >
                Entrar
              </Button>
              <Button
                as={NextLink}
                href="/auth/signup"
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize="sm"
                fontWeight={600}
                color="white"
                bg="blue.500"
                _hover={{
                  bg: 'blue.400',
                }}
              >
                Cadastrar
              </Button>
            </Stack>
          )}
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/people">Pessoas</NavLink>
            <NavLink href="/sales">Vendas</NavLink>
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}
