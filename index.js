const exec = require('@actions/exec');
const core = require('@actions/core');

const DEFAULT_DIR_MOD = 755;
const DEFAULT_KEYS_MOD = 600;
const DEFAULT_SSH_KNOWN_HOSTS_MOD = 644;

const KNOWN_HOSTS_FILE = 'known_hosts';

const createFileWithDataAndMode = async (data, path, mod) => {
  await exec.exec('/bin/sh -c', [`echo "${data}" >> ${path}`], { silent: true });
  await exec.exec('/bin/sh -c', [`chmod ${mod} ${path}`], { silent: true });
};

const recreateDirWithMod = async (path, mod) => {
  await exec.exec('/bin/sh -c', [`rm -rf ${path}`], { silent: true });
  await exec.exec('/bin/sh -c', [`mkdir ${path}`], { silent: true });
  await exec.exec('/bin/sh -c', [`chmod ${mod} ${path}`], { silent: true });
};

const run = async () => {
  try {
    const SSH_PRIVATE_KEY = core.getInput('ssh_private_key', { required: true });
    const SSH_PUBLIC_KEY = core.getInput('ssh_public_key', { required: true });
    const SSH_KNOWN_HOSTS = core.getInput('ssh_known_hosts', { required: true });

    const SSH_KEY_NAME = core.getInput('key_name');
    const SSH_FOLDER_PATH = core.getInput('exposed_ssh_folder_path');

    const FULL_KNOWN_HOSTS_PATH = `${SSH_FOLDER_PATH}/${KNOWN_HOSTS_FILE}`;

    const FULL_SSH_PRIVATE_KEY_PATH = `${SSH_FOLDER_PATH}/${SSH_KEY_NAME}`;
    const FULL_SSH_PUBLIC_KEY_PATH = `${FULL_SSH_PRIVATE_KEY_PATH}.pub`;

    await recreateDirWithMod(SSH_FOLDER_PATH, DEFAULT_DIR_MOD);

    await createFileWithDataAndMode(SSH_KNOWN_HOSTS, FULL_KNOWN_HOSTS_PATH, DEFAULT_SSH_KNOWN_HOSTS_MOD);
    await createFileWithDataAndMode(SSH_PRIVATE_KEY, FULL_SSH_PRIVATE_KEY_PATH, DEFAULT_KEYS_MOD);
    await createFileWithDataAndMode(SSH_PUBLIC_KEY, FULL_SSH_PUBLIC_KEY_PATH, DEFAULT_KEYS_MOD);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
