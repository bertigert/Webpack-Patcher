# Webpack Patcher
Library script to patch the code of webpack modules at runtime. Exposes a global register_webpack_patches function which can be used by any other script.

The performance hit depends on the site and the amount of patches, but on Deezer with multiple thousands of exports, the site takes 100ms-400ms longer to load on my system (after that there should be zero to none performance impact).

## Usage
To use it, take a look at the documentation of the exposed function in the source. The JSDocs provide a structure for how patches should look.

This script was originally designed for Deezer, but it should hypothetically work for other sites too.\
You should only need to replace the global Webpack array object's name with the one your site is using and update the userscript metadata to match your site.

#### This script itself has no functionality other than providing functionality to other scripts.

#### Any script using this script should mention that the user needs to install this in order for the script to work.

Also on Desktop using [DeezMod](https://github.com/bertigert/DeezMod): https://github.com/bertigert/DeezMod/tree/main/plugins/webpack_patcher

## Links
[Greazyfork](https://greasyfork.org/en/scripts/547520-webpack-patcher)

[GitHub](https://github.com/bertigert/Deezer-Webpack-Patcher)
