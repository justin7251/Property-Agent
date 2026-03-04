
import Link from 'next/link';
import {
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  IconButton,
  Flex,
  Box,
  Spacer,
} from '@chakra-ui/react';
import { FcMenu, FcHome, FcAbout } from 'react-icons/fc';
import { BsSearch } from 'react-icons/bs';
import { FiKey } from 'react-icons/fi';

const Navbar = () => (
  <Flex p='2' borderBottom='1px' borderColor='gray.100'>
    <Box fontSize='3xl' color='blue.400' fontWeight='bold'>
      <Link href='/'>Realtor</Link>
    </Box>
    <Spacer />
    <Box>
      <MenuRoot>
        <MenuTrigger asChild>
          <IconButton aria-label='Open menu' icon={<FcMenu />} variant='outline' color='red.400' />
        </MenuTrigger>
        <MenuPositioner>
          <MenuContent>
            <MenuItem asChild>
              <Link href='/'><FcHome style={{ marginRight: 8 }} />Home</Link>
            </MenuItem>
            <MenuItem asChild>
              <Link href='/search'><BsSearch style={{ marginRight: 8 }} />Search</Link>
            </MenuItem>
            <MenuItem asChild>
              <Link href='/search?purpose=for-sale'><FcAbout style={{ marginRight: 8 }} />Buy Property</Link>
            </MenuItem>
            <MenuItem asChild>
              <Link href='/search?purpose=for-rent'><FiKey style={{ marginRight: 8 }} />Rent Property</Link>
            </MenuItem>
          </MenuContent>
        </MenuPositioner>
      </MenuRoot>
    </Box>
  </Flex>
);

export default Navbar;
