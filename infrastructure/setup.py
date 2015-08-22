from setuptools import setup, find_packages

requirements = map(str.strip, open("requirements.txt").readlines())

setup(
    name = "infrastructure",
    packages = find_packages(),
    version = "0.1.0",
    install_requires = requirements
)
